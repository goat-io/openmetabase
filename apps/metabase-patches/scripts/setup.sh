#!/bin/bash

# Script to clone Metabase and apply patches

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCHES_DIR="$SCRIPT_DIR/../patches"
METABASE_DIR="$SCRIPT_DIR/../../metabase"

# Configuration
METABASE_REPO="https://github.com/metabase/metabase.git"
METABASE_BRANCH="master"  # Change this to the specific version/branch you need

echo "Setting up Metabase fork..."

# Clone Metabase if it doesn't exist
if [ ! -d "$METABASE_DIR" ]; then
    echo "Cloning Metabase repository..."
    git clone "$METABASE_REPO" "$METABASE_DIR"
    cd "$METABASE_DIR"
    git checkout "$METABASE_BRANCH"
else
    echo "Metabase directory already exists. Updating..."
    cd "$METABASE_DIR"
    git fetch origin
    git checkout "$METABASE_BRANCH"
    git pull origin "$METABASE_BRANCH"
fi

# Apply patches if any exist
if [ -d "$PATCHES_DIR" ] && [ "$(ls -A "$PATCHES_DIR"/*.patch 2>/dev/null)" ]; then
    echo "Applying patches..."
    for patch in "$PATCHES_DIR"/*.patch; do
        echo "Applying patch: $(basename "$patch")"
        git apply "$patch" || {
            echo "Failed to apply patch: $(basename "$patch")"
            echo "You may need to resolve conflicts manually"
            exit 1
        }
    done
    echo "All patches applied successfully!"
else
    echo "No patches found to apply."
fi

echo "Setup complete! Metabase is ready at: $METABASE_DIR"