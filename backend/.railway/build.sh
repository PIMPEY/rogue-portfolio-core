#!/bin/bash

set -e

echo "Starting Railway build..."

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "Build complete!"
