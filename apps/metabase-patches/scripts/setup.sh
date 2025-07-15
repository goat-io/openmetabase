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
    echo "Checking and applying patches..."
    applied_count=0
    skipped_count=0
    
    for patch in "$PATCHES_DIR"/*.patch; do
        patch_name="$(basename "$patch")"
        
        # Check if patch is already applied by attempting a dry run
        if git apply --check "$patch" 2>/dev/null; then
            echo "Applying patch: $patch_name"
            git apply "$patch"
            ((applied_count++))
        else
            # Check if it's already applied by trying reverse
            if git apply --check --reverse "$patch" 2>/dev/null; then
                echo "Patch already applied: $patch_name (skipping)"
                ((skipped_count++))
            else
                echo "Failed to apply patch: $patch_name"
                echo "This patch may conflict with current code or be partially applied"
                echo "You may need to resolve conflicts manually"
                exit 1
            fi
        fi
    done
    
    echo ""
    echo "Patch summary:"
    echo "  Applied: $applied_count patches"
    echo "  Skipped: $skipped_count patches (already applied)"
    echo ""
    
    if [ $applied_count -gt 0 ] || [ $skipped_count -gt 0 ]; then
        echo "All patches processed successfully!"
    fi
else
    echo "No patches found to apply."
fi

echo "Setup complete! Metabase is ready at: $(cd "$METABASE_DIR" && pwd)"