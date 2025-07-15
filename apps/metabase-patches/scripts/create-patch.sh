#!/bin/bash

# Script to create a patch from Metabase modifications

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
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes detected in Metabase directory"
    exit 0
fi

# Get patch name from user or use timestamp
PATCH_NAME="${1:-$(date +%Y%m%d-%H%M%S)}"
PATCH_FILE="$PATCHES_DIR/${PATCH_NAME}.patch"

echo "Creating patch: $PATCH_NAME"

# Create patch
git add -A
git diff --cached > "$PATCH_FILE"

# Reset changes
git reset

echo "Patch created successfully at: $PATCH_FILE"
echo ""
echo "To apply this patch later, run:"
echo "  cd $METABASE_DIR && git apply $PATCH_FILE"