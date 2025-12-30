#!/bin/bash

# Railway build script - migrations run at startup, not build
set -e

echo "Starting Railway build..."

cd app-web

# Install dependencies first
echo "Installing dependencies..."
npm ci

# Generate Prisma Client with Railway schema
echo "Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma.railway

# Build Next.js app
echo "Building Next.js app..."
npm run build

echo "Build complete!"
