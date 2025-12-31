#!/bin/bash
# Reset failed Prisma migrations

echo "🔧 Resetting failed migrations..."

# Mark the failed migration as rolled back
npx prisma migrate resolve --rolled-back "20251229155517_phase1_investment_setup"

echo "✅ Migration status reset. Now running migrations..."

# Deploy migrations
npx prisma migrate deploy

echo "✅ All done!"
