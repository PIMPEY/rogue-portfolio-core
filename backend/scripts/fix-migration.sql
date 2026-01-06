-- Fix the failed migration by marking it as rolled back
-- Run this in your Railway Postgres database

-- Option 1: Mark the failed migration as rolled back
UPDATE "_prisma_migrations" 
SET finished_at = started_at, 
    rolled_back_at = NOW(),
    logs = 'Manually rolled back via script'
WHERE migration_name = '20251229155517_phase1_investment_setup' 
  AND finished_at IS NULL;

-- Option 2: Delete the failed migration record (if Option 1 doesn't work)
-- DELETE FROM "_prisma_migrations" WHERE migration_name = '20251229155517_phase1_investment_setup';

-- Option 3: Nuclear option - clear all migration history
-- DROP TABLE IF EXISTS "_prisma_migrations";

-- After running one of the above, redeploy your backend service
