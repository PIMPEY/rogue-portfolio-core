# Railway Migration Fix Guide

## Problem

Railway backend is failing because of a **ghost migration** (`20251229155517_phase1_investment_setup`) that exists in the database but not in the migration files.

---

## Quick Fix (Recommended)

### Option 1: Use the Fix Script (Easiest)

**Windows:**
```bash
cd backend
fix-railway-migrations.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x fix-railway-migrations.sh
./fix-railway-migrations.sh
```

The script will guide you through the fix process.

---

### Option 2: Manual Fix

#### Step 1: Get Your Railway DATABASE_URL

1. Go to Railway dashboard
2. Click on your **PostgreSQL** service
3. Click **"Connect"** or look at **Variables**
4. Copy the `DATABASE_URL`

It should look like:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

#### Step 2: Set DATABASE_URL

**Windows (Command Prompt):**
```cmd
set DATABASE_URL=postgresql://postgres:password@host:port/database
```

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://postgres:password@host:port/database"
```

**Mac/Linux:**
```bash
export DATABASE_URL="postgresql://postgres:password@host:port/database"
```

#### Step 3: Check Migration Status

```bash
cd backend
npx prisma migrate status
```

You should see the ghost migration listed.

#### Step 4: Resolve Ghost Migration

```bash
npx prisma migrate resolve --rolled-back 20251229155517_phase1_investment_setup
```

#### Step 5: Deploy Migrations

```bash
npx prisma migrate deploy
```

#### Step 6: Verify

```bash
npx prisma migrate status
```

All migrations should show as applied.

---

### Option 3: Reset Database (Fastest)

If the above doesn't work, reset the database:

#### Step 1: Set DATABASE_URL
(See Option 2, Step 1-2)

#### Step 2: Reset Database

```bash
cd backend
npx prisma migrate reset --force
```

This will:
- Drop all tables
- Re-run all migrations
- Seed the database (if seed script exists)

⚠️ **Warning:** This deletes all data!

---

### Option 4: Recreate Railway Database (Cleanest)

If nothing works, recreate the database:

#### Step 1: Delete Railway PostgreSQL

1. Go to Railway dashboard
2. Click on your **PostgreSQL** service
3. Click **Settings**
4. Click **Delete Service**

#### Step 2: Create New PostgreSQL

1. Click **New Project** → **Database** → **PostgreSQL**
2. Railway will create a fresh database
3. Copy the new `DATABASE_URL`

#### Step 3: Update Backend Variables

1. Go to your **backend** service on Railway
2. Click **Variables**
3. Update `DATABASE_URL` with the new value

#### Step 4: Redeploy Backend

1. Click **Redeploy** on backend service
2. Wait 2-3 minutes
3. Migrations will run automatically

---

## After Fixing Migrations

### Step 1: Test Backend Health

Go to your backend URL:
```
https://your-backend-url.railway.app/health
```

You should see:
```json
{"status":"ok","timestamp":"..."}
```

### Step 2: Test Portfolio Endpoint

Go to:
```
https://your-backend-url.railway.app/api/portfolio
```

You should see an empty array `[]` or a list of investments.

### Step 3: Test Frontend

Go to your frontend URL:
```
https://your-frontend-url.railway.app
```

The dashboard should load without errors!

---

## Current Migration Files

Your backend has these migrations:

```
backend/prisma/migrations/
├── init/
│   └── migration.sql
├── add_review_system/
│   └── migration.sql
└── migration_lock.toml
```

These are the only tracked migrations. Any other migrations in the database are "ghost" migrations.

---

## Troubleshooting

### Error: "Migration already applied"

This means the migration is already in the database. Use:
```bash
npx prisma migrate resolve --applied 20251229155517_phase1_investment_setup
```

### Error: "Migration not found"

The migration doesn't exist in the migration files. Use:
```bash
npx prisma migrate resolve --rolled-back 20251229155517_phase1_investment_setup
```

### Error: "Database connection failed"

Check your `DATABASE_URL` is correct:
- Has the correct host
- Has the correct port
- Has the correct username/password
- Database name is correct

### Error: "Schema mismatch"

Your `schema.prisma` doesn't match the database. Run:
```bash
npx prisma db push
```

---

## Verification

After fixing, verify everything is working:

```bash
# Check migration status
npx prisma migrate status

# Check schema is in sync
npx prisma db pull

# Test backend
curl https://your-backend-url.railway.app/health

# Test portfolio endpoint
curl https://your-backend-url.railway.app/api/portfolio
```

---

## Summary

✅ **Best option:** Use `fix-railway-migrations.bat` (Windows) or `fix-railway-migrations.sh` (Mac/Linux)
✅ **Fastest option:** Recreate Railway PostgreSQL database
✅ **Cleanest option:** Reset database with `prisma migrate reset`

---

## Next Steps

After migrations are fixed:

1. ✅ Backend health endpoint returns 200
2. ✅ Portfolio endpoint returns data
3. ✅ Frontend dashboard loads without errors
4. ✅ Simple MVP works
5. ✅ ChatGPT analysis works

---

**Need help?** Check the Railway backend logs for detailed error messages!
