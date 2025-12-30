#!/bin/bash

# Railway build script
set -e

echo "Starting Railway build..."

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build Next.js app
echo "Building Next.js app..."
npm run build

echo "Build complete!"
