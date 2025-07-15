#!/bin/bash

# Script to update Metabase to latest version while preserving patches

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCHES_DIR="$SCRIPT_DIR/../patches"
METABASE_DIR="$SCRIPT_DIR/../../metabase"

if [ ! -d "$METABASE_DIR" ]; then
    echo "Error: Metabase directory not found at $METABASE_DIR"
    echo "Please run setup.sh first"
    exit 1
fi

cd "$METABASE_DIR"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Uncommitted changes detected in Metabase directory"
    echo "Please commit or stash changes before updating"
    exit 1
fi

echo "Updating Metabase to latest version..."

# Save current branch/commit
CURRENT_REF=$(git rev-parse HEAD)

# Update repository
git fetch origin
git pull origin master

echo "Reapplying patches..."

# Try to apply patches
FAILED_PATCHES=()
if [ -d "$PATCHES_DIR" ] && [ "$(ls -A "$PATCHES_DIR"/*.patch 2>/dev/null)" ]; then
    for patch in "$PATCHES_DIR"/*.patch; do
        echo "Applying patch: $(basename "$patch")"
        if ! git apply "$patch"; then
            FAILED_PATCHES+=("$(basename "$patch")")
            echo "Warning: Failed to apply patch: $(basename "$patch")"
        fi
    done
fi

if [ ${#FAILED_PATCHES[@]} -gt 0 ]; then
    echo ""
    echo "The following patches failed to apply:"
    for patch in "${FAILED_PATCHES[@]}"; do
        echo "  - $patch"
    done
    echo ""
    echo "You may need to update these patches for the new Metabase version"
else
    echo "All patches applied successfully!"
fi