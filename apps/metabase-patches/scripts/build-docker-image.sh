#!/bin/bash

# Script to build a Docker image from the modified Metabase

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
METABASE_DIR="$SCRIPT_DIR/../../metabase"
ROOT_DIR="$SCRIPT_DIR/../../.."
PACKAGE_JSON="$ROOT_DIR/package.json"

# Check if Metabase directory exists
if [ ! -d "$METABASE_DIR" ]; then
    echo "Error: Metabase directory not found at $METABASE_DIR"
    echo "Please run setup.sh first"
    exit 1
fi

# Get version from package.json
if [ ! -f "$PACKAGE_JSON" ]; then
    echo "Error: package.json not found at $PACKAGE_JSON"
    exit 1
fi

VERSION=$(grep -o '"version":\s*"[^"]*"' "$PACKAGE_JSON" | cut -d'"' -f4)
if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from package.json"
    exit 1
fi

echo "Building Docker image for Metabase with version: $VERSION"
echo ""

# Step 1: Build Metabase JAR
echo "Step 1: Building Metabase JAR file..."
cd "$METABASE_DIR"

# Clean up any previous build artifacts
rm -rf container-output

# Build the JAR
echo "Running Docker build with version $VERSION (this may take several minutes)..."
DOCKER_BUILDKIT=1 docker build --build-arg VERSION="$VERSION" --output container-output/ .

# Check if JAR was created
if [ ! -f "container-output/app/metabase.jar" ]; then
    echo "Error: metabase.jar was not created"
    exit 1
fi

echo "✓ Metabase JAR built successfully"
echo ""

# Step 2: Copy JAR to bin/docker
echo "Step 2: Preparing Docker build context..."
mkdir -p "$METABASE_DIR/bin/docker"
cp container-output/app/metabase.jar bin/docker/metabase.jar

echo "✓ JAR file copied to bin/docker/"
echo ""

# Step 3: Build final Docker image
echo "Step 3: Building final Docker image..."
cd bin/docker

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "Error: Dockerfile not found in bin/docker/"
    echo "The Metabase repository structure may have changed"
    exit 1
fi

# Build the image
IMAGE_NAME="openmetabase:$VERSION"
echo "Building image: $IMAGE_NAME"
DOCKER_BUILDKIT=1 docker build -t "$IMAGE_NAME" .

echo ""
echo "✅ Docker image built successfully!"
echo ""
echo "Image name: $IMAGE_NAME"
echo ""
echo "To use this image, update your infrastructure code to use:"
echo "  $IMAGE_NAME"
echo ""
echo "To run the image locally:"
echo "  docker run -p 3000:3000 $IMAGE_NAME"