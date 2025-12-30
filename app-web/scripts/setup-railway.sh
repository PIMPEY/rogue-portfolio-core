#!/bin/bash

# Setup Railway deployment schema
# This script copies the PostgreSQL schema for Railway deployment

echo "Setting up Railway schema..."

# Copy PostgreSQL schema
cp prisma/schema.prisma.railway prisma/schema.prisma

echo "Railway schema configured. Ready for deployment."
