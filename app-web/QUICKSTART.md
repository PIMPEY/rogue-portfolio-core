# Quick Start - Project Rogue MVP

## Option 1: One-Click Start (Windows)
Double-click `start-mvp.bat` to start the server and open your browser.

## Option 2: Manual Start
```cmd
cd app-web
npm start
```
Then open: http://localhost:3000

## If localhost doesn't work:
Try: http://192.168.85.18:3000

## Option 3: Static Demo (No Server)
Open `mvp-demo.html` directly in your browser.

## What You'll See
- Portfolio dashboard with 20 investments
- Status indicators (GREEN/AMBER/RED)
- Click any company to see detailed charts
- Revenue, Burn, Traction, and Runway comparisons
- Active flags and founder updates

## Troubleshooting
If you see "This site can't be reached":
1. Check if the server is running (look for "Next.js" window)
2. Try the network IP: http://192.168.85.18:3000
3. Open the static demo: mvp-demo.html