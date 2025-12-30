# Railway Deployment Debug Guide

## Check Railway Logs

### 1. View Build Logs
1. Go to your Railway project
2. Click on your Next.js service
3. Go to "Deployments" tab
4. Click on the failed deployment
5. Scroll down to see the build logs

### 2. View Runtime Logs
1. Go to your Next.js service
2. Click "Logs" tab
3. Look for error messages

## Common Issues & Solutions

### Issue 1: DATABASE_URL Not Set
**Error:** `Error validating datasource: the URL must start with postgresql://`

**Solution:**
1. Click on your PostgreSQL service in Railway
2. Click "Connect" → Copy connection string
3. Go to your Next.js service → "Variables" tab
4. Add `DATABASE_URL` variable with the connection string
5. Redeploy

### Issue 2: Prisma Client Not Generated
**Error:** `Error: @prisma/client did not initialize yet`

**Solution:**
The `postinstall` script should handle this. If it fails:
1. Go to "Console" tab in Railway
2. Run: `npx prisma generate`
3. Redeploy

### Issue 3: Migrations Failed
**Error:** Migration errors during build

**Solution:**
1. Go to "Console" tab in Railway
2. Run: `npx prisma migrate deploy`
3. Check for errors
4. If migrations fail, reset database:
   ```bash
   npx prisma migrate reset --force
   ```

### Issue 4: Build Timeout
**Error:** Build takes too long

**Solution:**
1. Check if `node_modules` is too large
2. Add `.dockerignore` or optimize dependencies
3. Increase Railway resources (upgrade plan)

### Issue 5: Port Not Exposed
**Error:** App not accessible

**Solution:**
Next.js uses port 3000 by default. Railway should auto-detect this.
If not, add to `railway.json`:
```json
{
  "deploy": {
    "port": 3000
  }
}
```

## Manual Debugging Steps

### Step 1: Check Environment Variables
In Railway Console:
```bash
echo $DATABASE_URL
```

### Step 2: Test Database Connection
In Railway Console:
```bash
npx prisma db push
```

### Step 3: Run Migrations Manually
In Railway Console:
```bash
npx prisma migrate deploy
```

### Step 4: Seed Database (Optional)
In Railway Console:
```bash
npm run seed
```

### Step 5: Start App Manually
In Railway Console:
```bash
npm run start
```

## Get Help

### Check Railway Status
- Railway Status: https://status.railway.app/

### Railway Documentation
- Deploying Next.js: https://docs.railway.app/deploy/nextjs
- Environment Variables: https://docs.railway.app/develop/variables
- Databases: https://docs.railway.app/deploy/databases

### Common Error Messages

#### "Cannot find module '@prisma/client'"
Run: `npm install`

#### "Error: P1001: Can't reach database server"
Check DATABASE_URL is correct and database is running

#### "Error: P3006: Migration failed"
Database schema mismatch. Reset database:
```bash
npx prisma migrate reset --force
```

## Quick Fix Checklist

- [ ] DATABASE_URL is set correctly
- [ ] PostgreSQL service is running
- [ ] Prisma Client is generated
- [ ] Migrations have run
- [ ] No TypeScript errors
- [ ] Build completed successfully
- [ ] App is listening on port 3000
