#!/bin/bash

# Railway build script
set -e

echo "Starting Railway build..."

cd app-web

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build Next.js app
echo "Building Next.js app..."
npm run build

echo "Build complete!"
