# Data Import/Export Guide

## Overview

You can now export data from the Railway portfolio and import it into the standalone HTML files. This allows you to use the full-featured Railway backend for data management while using the standalone HTML files for sharing and offline access.

## How to Export Data from Railway

### Step 1: Access Railway Portfolio
1. Go to your Railway portfolio URL
2. Log in if required
3. Wait for the portfolio to load (should show 20 investments)

### Step 2: Export Data
1. Click the **"Export JSON"** button in the top right
2. A file named `portfolio-export.json` will download automatically
3. This file contains all your investment data

## How to Import Data into Standalone HTML

### Option 1: Import via Button
1. Open `portfolio-standalone.html` in your browser
2. Click the **"Import JSON"** button
3. Select the `portfolio-export.json` file you downloaded
4. The data will load immediately and persist in localStorage

### Option 2: Manual Import (Advanced)
1. Open `portfolio-standalone.html` in your browser
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
   ```javascript
   // Paste your JSON data
   const data = [...your JSON data...];
   localStorage.setItem('rogue_investments', JSON.stringify(data));
   location.reload();
   ```

## Data Flow

```
Railway Backend (20 investments)
    ↓
Railway Portfolio Page
    ↓
Export JSON → portfolio-export.json
    ↓
Import JSON → Standalone HTML
    ↓
localStorage (persists offline)
```

## Features

### Railway Portfolio Page
- **Export JSON**: Download all investment data as JSON
- **Export CSV**: Download as CSV for Excel/Google Sheets
- Real-time data from database
- Full CRUD operations

### Standalone HTML Files
- **Import JSON**: Load data from Railway export
- **Export JSON**: Backup your data
- **localStorage**: Data persists offline
- No backend required

## Use Cases

### 1. Share Portfolio with Third Parties
1. Export from Railway
2. Import into standalone HTML
3. Share the HTML file or host on GitHub Pages
4. Third parties can view without Railway access

### 2. Offline Access
1. Export from Railway
2. Import into standalone HTML
3. Access portfolio anytime, even offline
4. Data persists in browser localStorage

### 3. Backup and Restore
1. Regularly export JSON from Railway
2. Keep backups of `portfolio-export.json`
3. Import into standalone HTML if needed
4. Restore Railway data from backup if needed

### 4. Data Analysis
1. Export JSON from Railway
2. Import into standalone HTML
3. Use browser DevTools to analyze data
4. Export to CSV for Excel/Google Sheets

## Data Structure

The JSON export contains an array of investments with the following structure:

```json
[
  {
    "id": "string",
    "companyName": "string",
    "sector": "string",
    "stage": "string",
    "geography": "string",
    "investmentType": "string",
    "committedCapitalEur": number,
    "deployedCapitalEur": number,
    "ownershipPercent": number | null,
    "investmentDate": "string (ISO date)",
    "currentFairValueEur": number,
    "grossMoic": "string",
    "grossIrr": "string",
    "roundSizeEur": number | null,
    "enterpriseValueEur": number | null,
    "runway": number | null,
    "status": "GREEN" | "AMBER" | "RED",
    "activeFlags": number,
    "founders": [
      {
        "name": "string",
        "email": "string"
      }
    ],
    "raisedFollowOnCapital": boolean,
    "clearProductMarketFit": boolean,
    "meaningfulRevenue": boolean,
    "totalUpdates": number,
    "latestUpdateQuarter": number
  }
]
```

## Troubleshooting

### Import Fails
- **Error**: "Invalid JSON format"
  - **Solution**: Ensure the file is valid JSON
  - Check that it's an array of investments
  - Use a JSON validator to check syntax

### Data Not Persisting
- **Issue**: Data disappears after closing browser
  - **Solution**: Check localStorage is enabled
  - Clear browser cache and try again
  - Export JSON regularly as backup

### Charts Not Displaying
- **Issue**: Charts show "No data available"
  - **Solution**: Ensure data has required fields
  - Check browser console for errors
  - Try a different browser

### Wrong Data Loaded
- **Issue**: Shows old data instead of new import
  - **Solution**: Clear localStorage:
    ```javascript
    localStorage.removeItem('rogue_investments');
    location.reload();
    ```
  - Then import the new JSON file

## Best Practices

1. **Regular Backups**: Export JSON weekly or after major changes
2. **Version Control**: Keep dated backups (e.g., `portfolio-2024-01-15.json`)
3. **Validate Data**: Check JSON structure before importing
4. **Test Import**: Import into a fresh browser to verify data
5. **Document Changes**: Keep a changelog of data modifications

## Security Considerations

- **Sensitive Data**: JSON exports contain all investment data
- **Access Control**: Only share with authorized parties
- **Storage**: Keep backups in secure locations
- **Encryption**: Consider encrypting sensitive exports
- **Retention**: Delete old exports when no longer needed

## Advanced Usage

### Batch Processing
```javascript
// Load multiple JSON files
const files = ['file1.json', 'file2.json'];
const allData = [];

files.forEach(file => {
  const data = JSON.parse(loadFile(file));
  allData.push(...data);
});

localStorage.setItem('rogue_investments', JSON.stringify(allData));
```

### Data Transformation
```javascript
// Transform data before import
const data = JSON.parse(loadFile('portfolio-export.json'));
const transformed = data.map(inv => ({
  ...inv,
  customField: calculateCustomValue(inv)
}));

localStorage.setItem('rogue_investments', JSON.stringify(transformed));
```

### Merge Data
```javascript
// Merge new data with existing
const existing = JSON.parse(localStorage.getItem('rogue_investments') || '[]');
const newData = JSON.parse(loadFile('new-data.json'));
const merged = [...existing, ...newData];

localStorage.setItem('rogue_investments', JSON.stringify(merged));
```

## Support

For issues or questions:
1. Check this guide
2. Review `STANDALONE_HTML_GUIDE.md`
3. Open an issue on GitHub

## Related Documentation

- `STANDALONE_HTML_GUIDE.md` - Using standalone HTML files
- `RAILWAY_QUICK_START.md` - Setting up Railway
- `RAILWAY_COMPLETE_DEPLOYMENT.md` - Full Railway deployment guide
