#!/bin/bash

set -e

echo "Starting Railway deployment..."

# Verify NEXT_PUBLIC_BACKEND_URL is set (optional but recommended)
echo "NEXT_PUBLIC_BACKEND_URL is set: ${NEXT_PUBLIC_BACKEND_URL:+yes}"

# Start the server
echo "Starting Next.js server..."
npm run start
