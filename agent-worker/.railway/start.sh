#!/bin/bash

set -e

echo "Starting agent worker..."

npx prisma generate

npm run start
