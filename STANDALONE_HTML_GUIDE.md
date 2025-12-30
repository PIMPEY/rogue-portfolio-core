# Standalone HTML Files - Quick Start Guide

## Overview

Three standalone HTML files are available that work without any build process or Railway deployment. They can be opened directly in a browser or hosted on GitHub Pages.

## Available Files

### 1. Simple MVP (`simple-mvp-standalone.html`)
**Purpose:** Create new investments with ChatGPT analysis

**Features:**
- Investment creation form
- ChatGPT-powered analysis
- Risk assessment and recommendations
- Works completely offline (no backend required)

**Use Case:** Quick investment analysis and creation

**URL:** `https://pimpey.github.io/rogue-portfolio-core/simple-mvp-standalone.html`

---

### 2. Portfolio Dashboard (`portfolio-standalone.html`)
**Purpose:** View all investments with charts and filters

**Features:**
- Portfolio overview with key metrics
- Investment table with sorting and filtering
- Charts for portfolio distribution
- Search by company name
- Filter by status (Active, Exited, etc.)

**Use Case:** Portfolio overview and management

**URL:** `https://pimpey.github.io/rogue-portfolio-core/portfolio-standalone.html`

---

### 3. Companies Page (`companies-standalone.html`)
**Purpose:** Detailed company metrics and analysis

**Features:**
- Company details with actuals vs forecast
- Financial metrics charts
- Founder updates and notes
- Flag system for tracking issues
- Investment details

**Use Case:** Deep dive into specific companies

**URL:** `https://pimpey.github.io/rogue-portfolio-core/companies-standalone.html?id=[investment-id]`

**Note:** Replace `[investment-id]` with an actual investment ID (e.g., `?id=1`)

---

## How to Use

### Option 1: Open Locally
1. Download the HTML file from the repository
2. Double-click to open in your browser
3. Works immediately, no setup required

### Option 2: GitHub Pages (Recommended)
1. Files are already hosted on GitHub Pages
2. Access via the URLs above
3. Share URLs directly with third parties

### Option 3: Custom Hosting
1. Upload HTML files to any web server
2. Access via your custom domain
3. No special configuration needed

---

## Data Management

### Simple MVP
- Creates investments in localStorage
- Data persists in your browser
- Export data to JSON for backup

### Portfolio & Companies
- Uses sample data by default
- Can import data from JSON export
- Data persists in localStorage

### Import/Export
```javascript
// Export data
localStorage.getItem('rogue_investments')

// Import data
localStorage.setItem('rogue_investments', JSON.stringify(yourData))
```

---

## Limitations

- **No backend:** Data is stored in browser localStorage only
- **No authentication:** Anyone with access can view/edit data
- **No real-time sync:** Changes don't sync across devices
- **Sample data:** Portfolio and Companies use sample data by default

---

## For Third Parties

### Sharing with Investors
1. Share the GitHub Pages URL
2. They can view the portfolio immediately
3. No login or setup required

### Sharing with Founders
1. Share the Companies page URL with their investment ID
2. They can view their company details
3. No authentication needed

### Demo Purposes
1. Use Simple MVP for live demos
2. Show portfolio overview with Dashboard
3. Drill down into companies with Companies page

---

## Next Steps

### For Full Functionality
If you need:
- Real database storage
- User authentication
- Real-time sync
- Multi-user access

Then use the Railway deployment:
- See `RAILWAY_QUICK_START.md` for setup
- See `RAILWAY_COMPLETE_DEPLOYMENT.md` for details

### For Quick Sharing
Use the standalone HTML files:
- No deployment needed
- Works immediately
- Perfect for demos and sharing

---

## Troubleshooting

### Charts Not Displaying
- Ensure JavaScript is enabled
- Check browser console for errors
- Try a different browser (Chrome, Firefox, Safari)

### Data Not Persisting
- Check localStorage is enabled
- Clear browser cache and try again
- Export data regularly as backup

### Import/Export Issues
- Ensure JSON format is correct
- Check for syntax errors in JSON
- Use browser DevTools to inspect localStorage

---

## Support

For issues or questions:
1. Check the main README.md
2. Review deployment guides in the repository
3. Open an issue on GitHub

---

## File Locations

All standalone HTML files are in the root directory:
- `simple-mvp-standalone.html`
- `portfolio-standalone.html`
- `companies-standalone.html`

They are also available on GitHub Pages at:
- `https://pimpey.github.io/rogue-portfolio-core/[filename].html`
