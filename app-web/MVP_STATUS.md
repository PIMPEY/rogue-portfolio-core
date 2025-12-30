# Project Rogue - MVP Status

## Current Status: 🚀 PRODUCTION DEPLOYED + HARDENING IN PROGRESS

The MVP is fully built, deployed to Railway production, and undergoing investment-grade security hardening.

## What's Built

### ✅ Core Features (100% Complete)

1. **Portfolio Dashboard**
   - View all 20 investments
   - Filter by status (ALL/GREEN/AMBER/RED)
   - Summary statistics
   - Click to view details

2. **Investment Detail Pages**
   - Company information
   - Revenue chart (Forecast vs Actual)
   - Burn chart (Forecast vs Actual)
   - Traction chart (Forecast vs Actual)
   - Runway chart over time
   - Active flags display
   - Founder updates with narratives

3. **Flag Engine**
   - Revenue Miss (<50% of forecast)
   - Traction Miss (<50% of forecast)
   - Burn Spike (>130% of forecast)
   - Burn Critical (>160% of forecast)
   - Runway Risk (<6 months)
   - Runway Critical (<3 months)

4. **Database**
   - 20 seeded investments
   - Forecasts for 8 quarters
   - Founder updates with actuals
   - Flags generated automatically

5. **API Routes**
   - `/api/portfolio` - Get all investments
   - `/api/investments/[id]` - Get investment details
   - `/api/test-flags` - Test flag engine

## How to Access

### Option 1: Fix Firewall (Recommended)
Run as Administrator:
```cmd
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

Then start the server:
```cmd
cd app-web
npm start
```

Open: http://localhost:3000

### Option 2: Use Network IP
The server also runs on: http://192.168.85.18:3000

### Option 3: Static HTML Demo
Open `app-web/mvp-demo.html` directly in your browser (bypasses server)

## Tech Stack
- Next.js 16.1.1 (App Router)
- React 19.2.3
- Prisma 6.19.1 (SQLite)
- Tailwind CSS 4
- Recharts 3.6.0
- TypeScript 5

## Missing MVP Features (Not Yet Implemented)
- Founder update submission endpoint
- Forecast entry UI
- Notes/investor action tracking
- Token-based founder authentication

## Production Deployment

### ✅ Railway Production (Live)
- **Frontend**: https://rogue-portfolio-core-production.up.railway.app
- **Backend**: https://rogue-portfolio-backend-production.up.railway.app
- **Database**: PostgreSQL on Railway
- **Status**: Healthy and operational

### 🔄 Production Hardening (7-Step Process)

**Phase 1: Foundation (3 steps)**
- ✅ Step 1: Secrets Hygiene - DATABASE_URL removed from frontend
- ✅ Step 2: Basic Operational Safety - Error handling middleware added
- ✅ Step 3: Environment Separation - Environment detection implemented

**Phase 2: Access Control (3 steps)**
- ⏳ Step 4: Authentication for Write Operations - Pending
- ⏳ Step 5: Change Rationale Enforcement - Pending
- ⏳ Step 6: Audit Log for Material Changes - Pending

**Phase 3: Environment Safety (1 step)**
- ⏳ Step 7: Seeding Discipline - Pending

### 📋 Staging Environment Setup
- Documentation created: `RAILWAY_STAGING_SETUP.md`
- Manual setup required via Railway dashboard
- See `RAILWAY_STAGING_SETUP.md` for detailed instructions

## Next Steps
1. ⏭️ Set up staging environment (manual Railway dashboard action)
2. ⏭️ Implement Phase 2: Access Control (authentication, change rationale, audit logging)
3. ⏭️ Implement Phase 3: Environment Safety (seeding discipline)
4. ⏭️ Add monitoring and observability
5. ⏭️ Implement missing MVP features (founder updates, forecast entry, notes)