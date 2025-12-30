# Railway Staging Environment Setup

This document describes how to set up a staging environment for the Project Rogue portfolio system on Railway.

## Overview

The system currently has a production environment. We need to add a staging environment for:
- Testing changes before production deployment
- Validating database migrations
- Testing API changes safely
- Environment separation for production hardening

## Prerequisites

- Railway account with access to `bountiful-renewal` project
- Railway CLI installed (optional, for some operations)
- Git repository with main branch

## Step 1: Create Staging Environment in Railway

### Option A: Using Railway Dashboard (Recommended)

1. Go to Railway dashboard: https://railway.app/project/bountiful-renewal
2. Click "New Environment" button
3. Name it: `staging`
4. Click "Create Environment"

### Option B: Using Railway CLI

```bash
railway environment create staging
```

## Step 2: Create Staging Services

### Frontend Service (Staging)

1. In the new `staging` environment, click "New Service"
2. Select "Deploy from GitHub repo"
3. Choose: `PIMPEY/rogue-portfolio-core`
4. Select branch: `main` (or create `staging` branch)
5. Set root directory: `app-web`
6. Configure environment variables:
   ```
   BACKEND_URL=https://rogue-portfolio-backend-staging.up.railway.app
   NODE_ENV=staging
   ```
7. Click "Deploy"

### Backend Service (Staging)

1. In the `staging` environment, click "New Service"
2. Select "Deploy from GitHub repo"
3. Choose: `PIMPEY/rogue-portfolio-core`
4. Select branch: `main` (or create `staging` branch)
5. Set root directory: `backend`
6. Configure environment variables:
   ```
   DATABASE_URL=<staging-database-url>
   NODE_ENV=staging
   ```
7. Click "Deploy"

### Database Service (Staging)

1. In the `staging` environment, click "New Service"
2. Select "Database"
3. Choose "PostgreSQL"
4. Click "Add Database"
5. Copy the DATABASE_URL from the database service
6. Update the backend service's DATABASE_URL variable with this value

## Step 3: Configure Environment Variables

### Frontend Staging Variables
```
BACKEND_URL=https://rogue-portfolio-backend-staging.up.railway.app
NODE_ENV=staging
```

### Backend Staging Variables
```
DATABASE_URL=postgresql://postgres:<password>@containers-us-west-<id>.railway.app:<port>/railway
NODE_ENV=staging
```

### Frontend Production Variables (Verify)
```
BACKEND_URL=https://rogue-portfolio-backend-production.up.railway.app
NODE_ENV=production
```

### Backend Production Variables (Verify)
```
DATABASE_URL=<production-database-url>
NODE_ENV=production
```

## Step 4: Run Database Migrations in Staging

Once the staging backend is deployed:

1. Open the staging backend service in Railway
2. Click "Console" tab
3. Run:
   ```bash
   npx prisma migrate deploy
   ```
4. Verify migrations are applied successfully

## Step 5: Verify Staging Environment

### Check Health Endpoints

**Frontend Staging:**
```bash
curl https://rogue-portfolio-core-staging.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-30T...",
  "environment": "staging",
  "railwayEnvironment": "staging"
}
```

**Backend Staging:**
```bash
curl https://rogue-portfolio-backend-staging.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-30T...",
  "environment": "staging",
  "railwayEnvironment": "staging"
}
```

### Test API Endpoints

```bash
# Get portfolio from staging
curl https://rogue-portfolio-backend-staging.up.railway.app/api/portfolio

# Get investments from staging
curl https://rogue-portfolio-backend-staging.up.railway.app/api/investments
```

## Step 6: Configure Deployment Workflow

### Option A: Branch-Based Deployment (Recommended)

1. Create a `staging` branch in your repository:
   ```bash
   git checkout -b staging
   ```

2. Configure Railway to deploy `staging` branch to staging environment:
   - Go to each service in staging environment
   - Click "Settings" → "Deployments"
   - Set branch to `staging`
   - Save

3. Configure Railway to deploy `main` branch to production environment:
   - Go to each service in production environment
   - Click "Settings" → "Deployments"
   - Set branch to `main`
   - Save

### Option B: Manual Deployment

Keep both environments on `main` branch and manually trigger deployments:
- Push to main → Production deploys automatically
- Manually trigger staging deployment when needed

## Step 7: Update Documentation

Update the following files with staging URLs:

- `RAILWAY_DEPLOYMENT.md` - Add staging environment section
- `README.md` - Add staging environment information
- `QUICKSTART.md` - Update with staging URLs

## Step 8: Test Staging Workflow

1. Make a small change to the codebase
2. Push to `staging` branch
3. Verify staging environment deploys successfully
4. Test the change in staging
5. Merge `staging` to `main`
6. Verify production deploys successfully

## Important Notes

### Security

- **NEVER** add DATABASE_URL to frontend environment variables
- Staging and production should use separate databases
- API keys and secrets should be different between environments

### Database

- Staging database can be seeded with test data
- Production database should NOT be seeded
- Use `npx prisma db seed` only in staging

### Monitoring

- Monitor both environments separately
- Set up alerts for staging environment
- Use staging for load testing before production

### Cost Management

- Staging environment can be paused when not in use
- Production environment should always be running
- Consider using Railway's free tier for staging

## Troubleshooting

### Staging deployment fails

1. Check Railway logs for the service
2. Verify environment variables are set correctly
3. Ensure DATABASE_URL is valid and accessible
4. Check that migrations are applied

### Health endpoint returns wrong environment

1. Verify NODE_ENV is set correctly
2. Check RAILWAY_ENVIRONMENT_NAME is set by Railway
3. Restart the service if needed

### Database connection errors

1. Verify DATABASE_URL is correct
2. Check database service is running
3. Ensure migrations are applied
4. Check network connectivity between services

## Next Steps

After staging is set up:

1. **Phase 2: Access Control**
   - Add authentication for write operations
   - Enforce change rationale
   - Implement audit logging

2. **Phase 3: Environment Safety**
   - Add seeding discipline checks
   - Implement environment-specific configurations
   - Set up automated testing in staging

3. **Monitoring & Observability**
   - Add logging to both environments
   - Set up error tracking
   - Configure performance monitoring

## References

- Railway Documentation: https://docs.railway.app/
- Railway Environments: https://docs.railway.app/guides/environments
- Railway CLI: https://docs.railway.app/develop/cli
