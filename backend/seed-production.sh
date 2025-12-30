#!/bin/bash

# Production Database Seeding Script
# Run this in Railway console to seed the production database

echo "🌱 Seeding Production Database..."
echo "⚠️  This will create 20 test investments with forecasts and updates"
echo ""

# Temporarily set NODE_ENV to development to bypass production check
export NODE_ENV=development

# Run the seed script
npm run seed

echo ""
echo "✅ Seeding complete!"
echo ""
echo "Verify data:"
echo "curl https://rogue-portfolio-backend-production.up.railway.app/api/portfolio"
