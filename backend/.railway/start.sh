#!/bin/bash

set -e

echo "Starting Railway deployment..."

# Verify DATABASE_URL is set
echo "DATABASE_URL is set: ${DATABASE_URL:+yes}"

# Run database migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the server
echo "Starting server..."
npm run start
