# Excel Template System - Setup & Usage Guide

## What Was Built

I've implemented the complete Excel template upload system that was planned by your previous agent. Here's what's now available:

### ✅ Completed Features

1. **Database Schema Updates**
   - Added `InvestmentThesis` model (for snapshot data: cash, burn, customers, entry valuation)
   - Added `InvestmentLiquidity` model (for expected liquidity year/type/valuation)
   - Expanded `MetricType` enum with COGS, OPEX, EBITDA

2. **Excel Template Processor**
   - Parses 2-sheet Excel files (Summary + Projections)
   - Validates data structure and types
   - Returns structured data with error messages

3. **API Endpoint**
   - POST `/api/templates/import` - Accepts Excel uploads for existing investments
   - Validates and previews data before saving
   - Persists to InvestmentThesis, InvestmentLiquidity, and Forecast tables

4. **Frontend UI**
   - Updated `/simple-mvp` page with Excel upload section
   - File validation and progress indicators
   - Success/error feedback

5. **Template Generation Script**
   - Script to create blank/sample/instruction Excel templates

6. **Bug Fixes**
   - Fixed investment detail page crash (data structure mismatch)

## Setup Instructions

### 1. Pull Latest Code

```bash
git fetch origin
git checkout claude/startup-investment-tracker-Q9cu1
git pull origin claude/startup-investment-tracker-Q9cu1
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- `xlsx` - Excel file parsing
- `multer` - File upload handling
- `@types/multer` - TypeScript types

### 3. Run Database Migration

Apply the new schema changes:

```bash
cd backend
npx prisma migrate deploy
# Or for development:
npx prisma migrate dev
```

This will create the `InvestmentThesis` and `InvestmentLiquidity` tables.

### 4. Generate Excel Templates

Create the template files:

```bash
cd backend
npx tsx src/scripts/create-excel-template.ts
```

This will generate 3 files in `backend/templates/`:
- `Investment_Template_Empty.xlsx` - Blank template
- `Investment_Template_Sample.xlsx` - Template with example data
- `Investment_Template_Instructions.xlsx` - Template with field descriptions

### 5. Deploy to Railway (Optional)

If you want to deploy to Railway:

```bash
# Make sure Railway CLI is installed
railway up

# Or push to trigger automatic deployment
git push origin claude/startup-investment-tracker-Q9cu1
```

Railway will automatically:
1. Install dependencies (including xlsx and multer)
2. Run database migrations
3. Restart the backend

## Excel Template Structure

### Sheet 1: Summary (2-column layout)

| Field Name | Value | Description |
|------------|-------|-------------|
| Company Name | TechStartup Inc. | Company name |
| Sector | SaaS | Industry sector |
| Stage | Seed | Investment stage |
| Investment Type | Equity | Type of investment |
| Currency | USD | Currency code |
| Committed Capital (Local) | 500000 | Committed amount |
| Ownership % | 15 | Ownership percentage |
| Entry Valuation | 3000000 | Entry valuation |
| isPostMoney | true | Post-money valuation? |
| Snapshot Date | 2024-01-15 | Snapshot date |
| Cash at Snapshot | 800000 | Cash balance |
| Monthly Burn | 50000 | Monthly burn rate |
| Customers at Snapshot | 25 | Customer count |
| Expected Liquidity Year | 3 | Expected exit year (1-5) |
| Expected Liquidity Valuation | 15000000 | Expected exit valuation |
| Expected Liquidity Type | M&A | Exit type |

### Sheet 2: Projections (Tabular layout)

| Metric | Y1 | Y2 | Y3 | Y4 | Y5 |
|--------|-----|-----|-----|-----|-----|
| Revenue | 100000 | 300000 | 800000 | 2000000 | 5000000 |
| COGS | 20000 | 60000 | 160000 | 400000 | 1000000 |
| Opex | 600000 | 800000 | 1200000 | 1800000 | 2500000 |
| EBITDA | -520000 | -560000 | -560000 | -200000 | 1500000 |

**Important Rules:**
- Exactly 5 years of projections required
- Annual values (converted to quarterly internally)
- No ARR row (Revenue is used instead)
- Monthly Burn required if Y1 revenue = 0 OR Y1 EBITDA < 0

## Usage Workflow

### Step 1: Create Investment

1. Go to https://rogue-portfolio-core-production-93df.up.railway.app/simple-mvp
2. Fill in basic investment details:
   - Company Name (required)
   - Sector
   - Stage
   - Committed Capital (required)
   - Deal Owner
3. Click **"Create Investment"**
4. Note the Investment ID in the success message

### Step 2: Upload Excel Template

1. Click **"Select Excel File"** in the Excel Template Upload section
2. Choose your filled-out Excel template (.xlsx or .xls)
3. Click **"Import Excel Template"**
4. Wait for validation and import
5. Check for success message or validation errors

### Step 3: View Investment with Data

1. Go to the Portfolio page: https://rogue-portfolio-core-production-93df.up.railway.app/
2. Click on the company name
3. You should now see:
   - Forecast vs Actual charts (populated from Projections sheet)
   - Investment details (populated from Summary sheet)
   - No more client-side errors!

## What Gets Populated

When you upload an Excel template, the following data is saved:

### InvestmentThesis Table
- Currency
- Entry Valuation (pre or post-money)
- isPostMoney flag
- Snapshot Date
- Snapshot Cash
- Snapshot Burn (monthly)
- Snapshot Customers

### InvestmentLiquidity Table
- Expected Year (1-5, relative to investment date)
- Expected Valuation
- Expected Type (M&A, IPO, Secondary, etc.)

### Forecast Table
- Creates new forecast version
- Converts annual projections to quarterly metrics
- Stores normalized: metricType + yearIndex + value
- Supports: REVENUE, COGS, OPEX, EBITDA

## Validation Rules

The Excel processor validates:

1. **Required Sheets**: Must have "Summary" and "Projections" sheets
2. **Field Names**: Must match exactly (case-sensitive)
3. **Data Types**:
   - Numbers for financial fields
   - Boolean for isPostMoney
   - Date format for Snapshot Date
4. **Projections**:
   - Exactly 5 years for each metric
   - Must have Revenue, COGS, Opex, EBITDA rows

If validation fails, you'll see specific error messages indicating:
- Which sheet has the error
- Which field is problematic
- What the issue is

## Troubleshooting

### "Investment not found"
- Make sure you created the investment first
- Check that the Investment ID is correct

### "Validation failed"
- Check the error messages for specific field issues
- Ensure field names match exactly (case-sensitive)
- Verify you have both Summary and Projections sheets
- Confirm all 4 metrics have exactly 5 years of data

### "Client-side exception" when clicking company
- This should be fixed now
- If it still occurs, check browser console for details
- The investment detail page now properly handles empty forecast/actuals

### Excel upload button not appearing
- Make sure you're on the `/simple-mvp` page
- Create an investment first to enable Excel upload

## Testing the Complete Workflow

### Test Case 1: Basic Flow

1. Create investment via Simple MVP
2. Download `Investment_Template_Sample.xlsx`
3. Upload template
4. View company page - should see forecast charts

### Test Case 2: Validation

1. Create investment
2. Upload template with missing fields
3. Should see validation errors
4. Fix errors and re-upload
5. Should succeed

### Test Case 3: Multiple Liquidity Years

1. Create investment
2. Manually edit template to have data for years 1-5
3. Upload
4. Check database that all 5 liquidity records created

## API Reference

### POST /api/templates/import

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Excel file (.xlsx or .xls)
  - `investmentId`: UUID of existing investment

**Response (Success):**
```json
{
  "success": true,
  "message": "Excel template imported successfully",
  "preview": {
    "summary": { ... },
    "projections": { ... },
    "warnings": []
  }
}
```

**Response (Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "validationErrors": [
    {
      "sheet": "Summary",
      "field": "Company Name",
      "message": "Field is required"
    }
  ],
  "preview": { ... }
}
```

## Next Steps

1. **Test the Excel Upload**
   - Create a test investment
   - Upload the sample template
   - Verify data appears correctly

2. **Create Your Own Template**
   - Download `Investment_Template_Empty.xlsx`
   - Fill with your company data
   - Upload and verify

3. **Integration Testing**
   - Test multiple companies
   - Verify forecast vs actual charts work
   - Check data integrity in database

4. **Production Deployment**
   - Push to Railway
   - Run migrations on production database
   - Generate templates on production

## Files Changed

### Backend
- `backend/prisma/schema.prisma` - Added new models and enum values
- `backend/package.json` - Added xlsx and multer dependencies
- `backend/src/lib/excel-template-processor.ts` - Excel parsing logic
- `backend/src/api/templates/import/route.ts` - Upload endpoint
- `backend/src/index.ts` - Registered upload endpoint with multer
- `backend/src/scripts/create-excel-template.ts` - Template generator
- `backend/prisma/migrations/20260103_add_thesis_liquidity_models/migration.sql` - Database migration

### Frontend
- `app-web/src/app/api/investments/[id]/route.ts` - Fixed data structure transformation
- `app-web/src/app/simple-mvp/page.tsx` - Added Excel upload UI

## Support

If you encounter any issues:

1. Check browser console for client-side errors
2. Check backend logs for server-side errors
3. Verify database migration completed successfully
4. Ensure all dependencies installed correctly
5. Test with sample template first before custom data

All changes have been pushed to the `claude/startup-investment-tracker-Q9cu1` branch.
