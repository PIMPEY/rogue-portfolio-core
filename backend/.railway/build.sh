#!/bin/bash

set -e

echo "Starting Railway build..."

# Generate Prisma Client with Railway schema
echo "Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma.railway

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "Build complete!"
