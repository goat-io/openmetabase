#!/bin/bash

# Script to reset Metabase to a clean state by removing all patches

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCHES_DIR="$SCRIPT_DIR/../patches"
METABASE_DIR="$SCRIPT_DIR/../../metabase"

echo "Resetting Metabase to clean state..."

# Check if Metabase directory exists
if [ ! -d "$METABASE_DIR" ]; then
    echo "Error: Metabase directory not found at $METABASE_DIR"
    echo "Run ./setup.sh first to clone Metabase"
    exit 1
fi

cd "$METABASE_DIR"

# Check if we have a git repository
if [ ! -d ".git" ]; then
    echo "Error: No git repository found in $METABASE_DIR"
    exit 1
fi

# Show current status
echo "Current git status:"
git status --short

# Stash any current changes
if [[ -n $(git status --porcelain) ]]; then
    echo ""
    echo "Stashing current changes..."
    git stash push -m "Auto-stash before reset-patches $(date +%Y-%m-%d_%H-%M-%S)"
    echo "Changes stashed successfully"
fi

# Reset to clean state
echo ""
echo "Resetting to clean git state..."
git reset --hard HEAD

# Clean untracked files
echo "Cleaning untracked files..."
git clean -fd

# Show final status
echo ""
echo "Final git status:"
git status

echo ""
echo "Metabase has been reset to a clean state!"
echo "All patches have been removed."
echo ""
echo "To re-apply patches, run: ./setup.sh"
echo "To create a new patch from your changes, run: ./create-patch.sh <patch-name>"