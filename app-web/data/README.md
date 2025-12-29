# Extracted Data Files

This directory contains the extracted data from the Project Rogue MVP database in multiple formats for easy viewing and repopulation.

## Files Available

### 1. `extracted-data.json`
**Format:** JSON
**Content:** Raw database export with all fields including IDs and timestamps
**Use case:** Technical reference, debugging, or programmatic import

### 2. `extracted-data-clean.json`
**Format:** JSON
**Content:** Cleaned data without internal IDs, formatted for readability
**Use case:** Easy human reading, data analysis, or manual editing

### 3. `extracted-data.csv`
**Format:** CSV (Comma Separated Values)
**Content:** Flat table with all data in a single sheet
**Columns:**
- Company Name, Sector, Stage, Investment Amount, Investment Type, Investment Date
- Founder Name, Founder Email
- Quarter (1-8)
- Type (FORECAST or ACTUAL)
- Revenue, Burn, Traction, Runway Months
- Narrative Good, Narrative Bad, Narrative Help

**Use case:** Excel/Google Sheets import, data analysis, bulk editing

### 4. `extracted-data.md`
**Format:** Markdown
**Content:** Human-readable documentation with tables
**Use case:** Documentation, presentations, quick reference

## Data Structure

Each company has:
1. **Company Info:** Name, sector, stage, investment details
2. **Founders:** Name and email
3. **Forecast (Base Case):** 8 quarters of projected revenue, burn, and traction
4. **Actuals:** Submitted quarterly updates with metrics and narratives

## How to Use

### To View Data:
- Open `extracted-data.md` in any text editor or Markdown viewer
- Open `extracted-data.csv` in Excel or Google Sheets
- Open `extracted-data-clean.json` in any JSON viewer

### To Repopulate Database:
1. Edit the data in your preferred format
2. Use the import script (to be created) to load back into database
3. Or manually update via the UI when implemented

### To Create New Companies:
Copy the structure from an existing company and modify:
- Company details
- Founder information
- Forecast values (8 quarters)
- Actuals (as they become available)

## Notes

- All monetary values are in USD
- Traction is a unitless metric (could be users, customers, etc.)
- Runway is in months
- Narratives are optional text fields for founder updates
- The seed script created 20 companies with 1-4 quarters of actuals each

## Sample Data Structure (JSON)

```json
{
  "company": {
    "name": "CloudSync AI",
    "sector": "SaaS",
    "stage": "Pre-Seed",
    "investmentAmount": 850000,
    "currency": "USD",
    "investmentType": "SAFE",
    "investmentDate": "2024-01-01T00:00:00.000Z",
    "status": "ACTIVE"
  },
  "founders": [
    {
      "name": "Founder 1",
      "email": "founder1@cloudsyncai.com"
    }
  ],
  "forecast": {
    "version": 1,
    "startQuarter": "2024-01-01T00:00:00.000Z",
    "horizonQuarters": 8,
    "revenue": [
      { "quarter": 1, "value": 12000 },
      { "quarter": 2, "value": 14400 },
      ...
    ],
    "burn": [...],
    "traction": [...]
  },
  "actuals": [
    {
      "quarter": 1,
      "submittedAt": "2024-04-01T00:00:00.000Z",
      "revenue": 6000,
      "burn": 82500,
      "traction": 75,
      "runwayMonths": 8.5,
      "narrativeGood": "Strong customer acquisition",
      "narrativeBad": "Higher than expected burn",
      "narrativeHelp": "Need help with hiring"
    },
    ...
  ]
}
```