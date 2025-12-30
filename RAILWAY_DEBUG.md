# Railway Backend Debugging Guide

## Problem: Frontend Shows 500 Error

The frontend is getting a 500 error from the backend. This means the backend is failing to start or connect to the database.

---

## Step 1: Check Backend Logs

1. Go to Railway dashboard
2. Click on your **backend** service
3. Click the **"Logs"** tab
4. Look for error messages

**Common Errors:**

### Error: "DATABASE_URL is not set"
**Solution:**
1. Go to backend service → Variables
2. Add `DATABASE_URL` (Railway should provide this automatically when you add a PostgreSQL database)
3. If not, create a PostgreSQL database first, then Railway will set `DATABASE_URL` automatically

### Error: "Prisma Client initialization failed"
**Solution:**
1. Make sure `DATABASE_URL` is set correctly
2. Check the database is running
3. Try redeploying the backend

### Error: "Migration failed"
**Solution:**
1. The database schema might not match
2. Try running `npx prisma migrate deploy` manually in Railway console
3. Or delete the database and recreate it

### Error: "Port already in use"
**Solution:**
1. Railway should handle this automatically
2. Try redeploying the service

---

## Step 2: Verify Database Connection

1. Go to Railway dashboard
2. Click on your **PostgreSQL** database service
3. Check it's running (green status)
4. Click "Connect" to see the connection string

**The DATABASE_URL should look like:**
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

---

## Step 3: Check Backend Variables

Your backend should have these variables:

```
OPENAI_API_KEY = sk-G5T31_rHNu5Xnh8_1ZWfJw
DATABASE_URL = (Railway provides this automatically)
```

**To check:**
1. Go to backend service
2. Click "Variables" tab
3. Verify both are set

---

## Step 4: Test Backend Health Endpoint

1. Find your backend URL (e.g., `https://project-rogue-backend-production.up.railway.app`)
2. Open in browser: `https://project-rogue-backend-production.up.railway.app/health`
3. You should see: `{"status":"ok","timestamp":"..."}`

**If this fails, the backend is not running at all.**

---

## Step 5: Redeploy Backend

1. Go to backend service
2. Click "Redeploy" button
3. Wait 2-3 minutes
4. Check logs again

---

## Step 6: Check Database Migrations

The backend runs `npx prisma migrate deploy` on startup. Check logs for:

```
Running Prisma migrations...
```

**If you see errors here:**
1. The database schema might be wrong
2. Try deleting the database and recreating it
3. Railway will run migrations automatically on new database

---

## Quick Fix: Recreate Database

If nothing works, try this:

1. **Delete the PostgreSQL database** on Railway
2. **Create a new PostgreSQL database**
3. **Railway will automatically set `DATABASE_URL`**
4. **Redeploy the backend**
5. **Migrations will run automatically**

---

## Alternative: Use Simple MVP Only

If the backend keeps failing, you can:

1. **Use the Simple MVP page directly:**
   ```
   https://your-frontend-url.railway.app/simple-mvp
   ```

2. **The Simple MVP doesn't need the portfolio endpoint**
   - It creates investments directly
   - It analyzes documents with ChatGPT
   - It works even if the portfolio endpoint fails

3. **Skip the dashboard for now**
   - Focus on Simple MVP functionality
   - Fix the backend later

---

## What to Tell Me

If you're still stuck, tell me:

1. **What error do you see in the backend logs?**
2. **Is the database running?** (green status on Railway)
3. **What happens when you visit `/health` endpoint?**
4. **Are both variables set?** (OPENAI_API_KEY and DATABASE_URL)

---

## Current Status

✅ Frontend is robust (handles errors gracefully)
✅ Simple MVP works independently
❌ Backend needs debugging

**Next:** Check backend logs and tell me what you see!
