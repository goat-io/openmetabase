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

# Reverse any applied patches first
echo "Checking for applied patches to reverse..."
REVERSED_PATCHES=()
if [ -d "$PATCHES_DIR" ] && [ "$(ls -A "$PATCHES_DIR"/*.patch 2>/dev/null)" ]; then
    for patch in "$PATCHES_DIR"/*.patch; do
        patch_name="$(basename "$patch")"
        # Check if patch is applied by trying to reverse it
        if git apply --check --reverse "$patch" 2>/dev/null; then
            echo "Reversing patch: $patch_name"
            git apply --reverse "$patch"
            REVERSED_PATCHES+=("$patch_name")
        fi
    done
fi

if [ ${#REVERSED_PATCHES[@]} -gt 0 ]; then
    echo "Reversed ${#REVERSED_PATCHES[@]} patches"
fi

# Now check for any remaining uncommitted changes
if [ -n "$(git -C . status --porcelain)" ]; then
    echo "Error: Uncommitted changes detected in Metabase directory after reversing patches"
    echo "Please commit or stash these changes before updating"
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
APPLIED_PATCHES=()
SKIPPED_PATCHES=()

if [ -d "$PATCHES_DIR" ] && [ "$(ls -A "$PATCHES_DIR"/*.patch 2>/dev/null)" ]; then
    for patch in "$PATCHES_DIR"/*.patch; do
        patch_name="$(basename "$patch")"
        
        # Check if patch can be applied
        if git apply --check "$patch" 2>/dev/null; then
            echo "Applying patch: $patch_name"
            git apply "$patch"
            APPLIED_PATCHES+=("$patch_name")
        else
            # Check if it's already applied
            if git apply --check --reverse "$patch" 2>/dev/null; then
                echo "Patch already applied: $patch_name (skipping)"
                SKIPPED_PATCHES+=("$patch_name")
            else
                FAILED_PATCHES+=("$patch_name")
                echo "Warning: Failed to apply patch: $patch_name"
            fi
        fi
    done
fi

echo ""
echo "Update summary:"
echo "  Applied: ${#APPLIED_PATCHES[@]} patches"
echo "  Skipped: ${#SKIPPED_PATCHES[@]} patches (already applied)"
echo "  Failed: ${#FAILED_PATCHES[@]} patches"

if [ ${#FAILED_PATCHES[@]} -gt 0 ]; then
    echo ""
    echo "The following patches failed to apply:"
    for patch in "${FAILED_PATCHES[@]}"; do
        echo "  - $patch"
    done
    echo ""
    echo "You may need to update these patches for the new Metabase version"
else
    echo ""
    echo "All patches processed successfully!"
fi