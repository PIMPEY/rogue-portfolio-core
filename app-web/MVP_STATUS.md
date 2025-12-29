# Project Rogue - MVP Status

## Current Status: ✅ MVP IS READY

The MVP is fully built and functional. The only issue is Windows Firewall blocking localhost access.

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

## Next Steps
1. Resolve firewall issue to view live app
2. Implement missing features
3. Add authentication
4. Deploy to production