#!/bin/bash

# Railway build script
set -e

echo "Starting Railway build..."

# Clear npm cache to avoid EBUSY errors
echo "Clearing npm cache..."
rm -rf /app/node_modules/.cache || true

# Install dependencies
echo "Installing dependencies..."
npm ci --prefer-offline --no-audit

# Build Next.js app
echo "Building Next.js app..."
npm run build

echo "Build complete!"
