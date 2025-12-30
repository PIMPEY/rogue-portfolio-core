# How to Seed Production Database and View the Site

## Current Status

✅ **Frontend**: https://rogue-portfolio-core-production.up.railway.app (Running)
✅ **Backend**: https://rogue-portfolio-backend-production.up.railway.app (Running)
❌ **Database**: Empty (needs seeding)

## Quick Start (5 minutes)

### Step 1: Seed the Production Database

1. Go to Railway dashboard: https://railway.app/project/bountiful-renewal
2. Click on the **backend** service
3. Click the **Console** tab
4. Copy and paste this command:

```bash
NODE_ENV=development npm run seed
```

5. Press Enter and wait for seeding to complete (should take 30-60 seconds)
6. You should see "Seed completed!" message

### Step 2: Verify the Data

In the same console, run:

```bash
curl https://rogue-portfolio-backend-production.up.railway.app/api/portfolio
```

You should see a large JSON array with 20 investments.

### Step 3: View the Site

Open your browser and go to:
**https://rogue-portfolio-core-production.up.railway.app**

You should see:
- Portfolio dashboard with 20 investments
- Filter buttons (ALL/GREEN/AMBER/RED)
- Summary statistics
- Click on any investment to see details

## What You'll See

### Portfolio Dashboard
- 20 investments across different sectors (SaaS, Fintech, Healthcare, etc.)
- Color-coded status indicators (GREEN/AMBER/RED)
- Summary stats: Total investments, Total committed capital, etc.

### Investment Details
Click any investment to see:
- Company information (name, sector, stage, geography)
- Revenue chart (Forecast vs Actual)
- Burn chart (Forecast vs Actual)
- Traction chart (Forecast vs Actual)
- Runway chart over time
- Active flags (if any)
- Founder updates with narratives

### Flags
The system automatically generates flags based on:
- Revenue Miss (<50% of forecast)
- Traction Miss (<50% of forecast)
- Burn Spike (>130% of forecast)
- Burn Critical (>160% of forecast)
- Runway Risk (<6 months)
- Runway Critical (<3 months)

## Troubleshooting

### Seeding Fails

If you see "SEEDING BLOCKED" error:
```bash
# Make sure you're using this exact command:
NODE_ENV=development npm run seed
```

### Backend Returns Empty Array

If `/api/portfolio` returns `[]`:
- Seeding didn't complete successfully
- Try running the seed command again
- Check for error messages in the console

### Frontend Shows Loading

If the frontend keeps loading:
- Backend might be restarting
- Wait 1-2 minutes and refresh
- Check Railway dashboard for backend service status

### Can't Access Railway Console

If you don't have access to Railway:
- Contact the project owner for Railway access
- Or use the API to create test data (requires API_TOKEN setup)

## Alternative: Create Test Data via API

If you can't use the Railway console, you can create test investments via the API:

1. Generate an API token:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Add API_TOKEN to Railway backend variables (via dashboard)

3. Create an investment:
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
    "rationale": "Creating test investment"
  }'
```

Repeat with different data to create more investments.

## Next Steps

After viewing the site:

1. **Set up API_TOKEN** - Required for write operations (see `backend/AUTH_SETUP.md`)
2. **Test write operations** - Create/update investments via API
3. **Review audit logs** - Check the audit trail for changes
4. **Explore the data** - Click through investments and view charts

## Documentation

- `backend/AUTH_SETUP.md` - API authentication setup
- `backend/SEED_PRODUCTION.md` - Detailed seeding instructions
- `app-web/MVP_STATUS.md` - Project status and features

## Support

If you encounter issues:
1. Check Railway service logs
2. Verify backend health: `curl https://rogue-portfolio-backend-production.up.railway.app/health`
3. Check frontend health: `curl https://rogue-portfolio-core-production.up.railway.app/api/health`
4. Review this guide for troubleshooting steps
