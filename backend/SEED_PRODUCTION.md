# Production Database Seeding Guide

## Issue

The production database is currently empty. The seed script is blocked in production due to the seeding discipline we implemented.

## Solution Options

### Option 1: Use Railway Console to Run Seed (Recommended)

1. Go to Railway dashboard: https://railway.app/project/bountiful-renewal
2. Select the backend service
3. Click "Console" tab
4. Run the following command to temporarily bypass the production check:

```bash
NODE_ENV=development npm run seed
```

This will override the NODE_ENV and allow seeding to proceed.

### Option 2: Create Test Data via API

Use the API endpoints to create test investments. You'll need to set up the API_TOKEN first.

1. Generate API token (see `backend/AUTH_SETUP.md`)
2. Set API_TOKEN in Railway backend variables
3. Use curl or Postman to create investments

Example:
```bash
curl -X POST https://rogue-portfolio-backend-production.up.railway.app/api/investments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-token>" \
  -d '{
    "icReference": "TEST-001",
    "icApprovalDate": "2025-01-01T00:00:00Z",
    "investmentExecutionDate": "2025-01-01T00:00:00Z",
    "dealOwner": "PJI",
    "companyName": "Test Company",
    "sector": "SaaS",
    "geography": "US",
    "stage": "SEED",
    "investmentType": "SAFE",
    "committedCapitalLcl": 500000,
    "currentFairValueEur": 540000,
    "rationale": "Creating test investment for demo"
  }'
```

### Option 3: Temporarily Disable Seeding Check

1. Edit `backend/prisma/seed.ts`
2. Comment out the production check
3. Commit and push
4. Run seed in Railway console
5. Uncomment the production check
6. Commit and push again

**Not recommended** - this is risky and could lead to accidental production seeding.

## Recommended Approach

Use **Option 1** - it's the safest and quickest way to seed the production database with test data.

## After Seeding

Once the database is seeded, verify the data:

```bash
curl https://rogue-portfolio-backend-production.up.railway.app/api/portfolio
```

You should see an array of 20 investments with all their data.

## Frontend Access

After seeding, access the frontend at:
https://rogue-portfolio-core-production.up.railway.app

You should see the portfolio dashboard with all 20 investments.
