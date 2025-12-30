#!/bin/bash

set -e

echo "Starting Railway build..."

# Use Railway schema (PostgreSQL)
echo "Switching to Railway schema..."
cp prisma/schema.prisma.railway prisma/schema.prisma

# Generate Prisma Client with Railway schema
echo "Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma.railway

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "Build complete!"
