# Fix Failed Migration

## Problem
Prisma found a failed migration in the database:
```
The `20251229155517_phase1_investment_setup` migration started at 2025-12-30 12:38:48.954669 UTC failed
```

## Solutions

### Option 1: Mark as Rolled Back (Safe - keeps data)
If you want to keep any existing data:

```bash
# In Railway, open the Database service
# Click "Data" tab or use the Railway CLI to connect
# Then run:
npx prisma migrate resolve --rolled-back "20251229155517_phase1_investment_setup" --schema=./backend/prisma/schema.prisma

# Then redeploy the backend service
```

### Option 2: Reset Database (Clean slate - loses data)
If the database is empty or you don't need the data:

**Via Railway Dashboard:**
1. Go to your Postgres database service
2. Click "Data" tab
3. Run this SQL:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO railway;
GRANT ALL ON SCHEMA public TO public;
```
4. Redeploy your backend service (migrations will run fresh)

**OR via Railway CLI:**
```bash
railway run npx prisma migrate reset --force --schema=./backend/prisma/schema.prisma
```

### Option 3: Delete Migration History (Nuclear option)
```sql
-- This clears the migration tracking table
DROP TABLE IF EXISTS "_prisma_migrations";
```
Then redeploy - Prisma will treat it as a fresh database.

## Recommended Approach

Since this appears to be a development/staging environment:

1. **Reset the database** (Option 2)
2. Let migrations run fresh on next deploy
3. Done! ✅

## After Fix

Once you've chosen an option and executed it, redeploy the backend service in Railway.
You should see:
```
🔄 Running database migrations...
✅ Migrations complete!
🚀 Starting server...
✅ Backend server running on port 3001
```
