#!/bin/bash

set -e

echo "Starting application..."

# Wait for database to be ready
echo "Waiting for database connection..."
until npx prisma db push --skip-generate > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

echo "Starting Next.js..."
npm run start
