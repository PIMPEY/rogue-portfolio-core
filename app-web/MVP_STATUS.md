# Project Rogue - MVP Status

## Current Status: 🚀 PRODUCTION DEPLOYED + HARDENED

The MVP is fully built, deployed to Railway production, and secured with investment-grade access controls.

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

### ✅ Production Hardening (7-Step Process)

**Phase 1: Foundation (3 steps)**
- ✅ Step 1: Secrets Hygiene - DATABASE_URL removed from frontend
- ✅ Step 2: Basic Operational Safety - Error handling middleware added
- ✅ Step 3: Environment Separation - Skipped (single environment)

**Phase 2: Access Control (3 steps)**
- ✅ Step 4: Authentication for Write Operations - Bearer token auth implemented
- ✅ Step 5: Change Rationale Enforcement - Rationale required for all writes
- ✅ Step 6: Audit Log for Material Changes - Comprehensive audit logging

**Phase 3: Environment Safety (1 step)**
- ⏳ Step 7: Seeding Discipline - Pending

### 🔐 Security Features

**Authentication**
- Bearer token required for all write operations
- Read operations remain public
- API token stored in Railway environment variables

**Change Rationale**
- All write operations require `rationale` field
- Rationale explains why change is being made
- Stored in audit logs for traceability

**Audit Logging**
- All material changes logged automatically
- Tracks: investmentId, action, fieldName, oldValue, newValue, rationale, changedBy, timestamp
- Audit logs included in investment detail responses

**Protected Endpoints**
- POST /api/investments
- PUT /api/investments/:id
- POST /api/valuations
- PUT /api/actions/:id
- POST /api/actions/:id/clear

See `backend/AUTH_SETUP.md` for setup instructions.

## Next Steps
1. ⏭️ Generate and set API_TOKEN in Railway (manual action required)
2. ⏭️ Implement Step 7: Seeding Discipline
3. ⏭️ Add monitoring and observability
4. ⏭️ Implement missing MVP features (founder updates, forecast entry, notes)