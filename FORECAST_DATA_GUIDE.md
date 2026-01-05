# Forecast Data Population Guide

This guide explains how to populate various data points in the investment forecast system.

## 1. Populating Forecast Data (Revenue, COGS, OPEX, CAPEX, EBITDA, Cash Balance)

### Method A: Using the Inline Editor (NEW)
1. Navigate to an investment detail page
2. The "Forecast Management" section appears with an editable table
3. Select your horizon (1, 3, or 5 years)
4. Click on any cell to enter values for:
   - **Revenue**: Expected revenue per quarter
   - **COGS**: Cost of goods sold
   - **OPEX**: Operating expenses
   - **CAPEX**: Capital expenditures (hardware, equipment)
   - **EBITDA**: Earnings before interest, taxes, depreciation, amortization
   - **Cash Balance**: Expected cash on hand per quarter
5. Click "Save Forecast" button
6. Charts will automatically update

### Method B: Using Excel Upload (Bulk)
1. Click "Advanced: Bulk Import from Excel" to expand
2. Download the template using "Download Template" button
3. Fill in the "Projections" sheet with Y1-Y5 data
4. Upload the completed file
5. System creates forecast data automatically

### Backend Storage
Both methods save to:
- **Table**: `Forecast` (version, startQuarter, horizonQuarters)
- **Table**: `ForecastMetric` (metric type, quarterIndex, value)

---

## 2. Populating "Current Runway"

The "Current Runway" metric is calculated and populated in **two ways**:

### Primary Source: Actual Data from Founder Updates
When founders submit quarterly updates, the `actualRunwayMonths` value appears here:

**Table**: `FounderUpdate`
```sql
INSERT INTO FounderUpdate (
  investmentId,
  quarterIndex,
  actualRunwayMonths,  -- This value
  actualRevenue,
  actualBurn,
  actualTraction
) VALUES (...)
```

### Fallback: Calculated from Excel Upload
If no founder updates exist, it falls back to the calculated runway from Excel:

**Table**: `Investment`
```sql
UPDATE Investment SET
  calculatedRunwayMonths = (cashAtSnapshot / monthlyBurn),
  cashAtSnapshot = 1200000,  -- From Excel
  monthlyBurn = 66667         -- From Excel
WHERE id = 'investment-id';
```

**Display Logic** (see `page.tsx:410-415`):
```typescript
{actuals.runway.length > 0
  ? `${actuals.runway[actuals.runway.length - 1].value.toFixed(1)} months` // From founder updates
  : investment.calculatedRunwayMonths
    ? `${investment.calculatedRunwayMonths.toFixed(1)} months`  // From Excel
    : 'N/A'}
```

---

## 3. Populating "ETA Next Fundraise"

This is calculated automatically based on runway data:

### Logic (see `page.tsx:420-444`):
1. **If** `expectedLiquidityDate` is set in Investment table → Use that date
2. **Else** Calculate: `calculatedRunwayMonths - 6 months` (companies typically fundraise 6 months before runway expires)
3. **Format**: Shows next round name (Series A, B, C) + Quarter + Year

### To Set Manually:
**Table**: `Investment`
```sql
UPDATE Investment SET
  expectedLiquidityDate = '2025-Q3',
  liquidityExpectation = 'Series A - Q3 2025'
WHERE id = 'investment-id';
```

### Populated via Excel:
The Excel template has a "Liquidity Expectations" section:
- **Field**: Expected Liquidity Date
- **Field**: Expected Liquidity Type
- Maps to `expectedLiquidityDate` and `liquidityExpectation`

---

## 4. Populating "Active Flags"

Flags are automatically generated when forecast vs actual variance exceeds thresholds.

### Auto-Generated (Backend Logic)
When a founder submits an update, the system compares actual vs forecast:

**Example**: Revenue Miss Flag
```javascript
if (actualRevenue < forecastRevenue * 0.8) {  // 20% miss
  await prisma.flag.create({
    data: {
      investmentId: id,
      type: 'REVENUE_MISS',
      metric: 'REVENUE',
      threshold: '20% below forecast',
      actualValue: actualRevenue,
      forecastValue: forecastRevenue,
      deltaPct: (actualRevenue - forecastRevenue) / forecastRevenue,
      status: 'NEW'
    }
  });
}
```

### Manual Flag Creation
You can also create flags manually:

**API Endpoint**: `POST /api/flags`
```json
{
  "investmentId": "xxx",
  "type": "BURN_SPIKE",
  "threshold": "Burn rate increased 30%",
  "status": "MONITORING"
}
```

---

## 5. Populating "Latest Update"

Shows the most recent founder quarterly update.

### Display Logic (see `page.tsx:454-471`):
1. **If** founder updates exist → Shows `Q{quarterIndex}` of latest update
2. **Else** Shows days since investment:
   - **< 90 days**: Shows "{X}d" (e.g., "45d")
   - **≥ 90 days**: Shows "OVERDUE" in red

### How Founders Submit Updates

**API Endpoint**: `POST /api/investments/{id}/updates`
```json
{
  "quarterIndex": 2,
  "actualRevenue": 150000,
  "actualBurn": 80000,
  "actualRunwayMonths": 15,
  "actualTraction": 120,
  "narrativeGood": "Signed 3 major clients",
  "narrativeBad": "Lost key engineer",
  "narrativeHelp": "Need intro to AWS"
}
```

**Table**: `FounderUpdate`
- Each update creates a new row
- Latest update is shown in the "Latest Update" card
- All updates appear in the "Founder Updates" section below charts

---

## 6. Populating Actuals Data (for Charts)

Actuals appear as **green dots** on the forecast charts (Revenue, Burn, Traction).

### Data Source
**Table**: `FounderUpdate`

Each founder update contains:
- `actualRevenue` → Appears on Revenue chart
- `actualBurn` → Appears on Burn chart
- `actualTraction` → Appears on Traction chart
- `actualRunwayMonths` → Appears on Runway chart

### Backend Transformation (see `backend/src/index.ts:275-285`)
```javascript
const actualData = {
  revenue: founderUpdates.map(u => ({
    quarter: u.quarterIndex,
    value: u.actualRevenue
  })),
  burn: founderUpdates.map(u => ({
    quarter: u.quarterIndex,
    value: u.actualBurn
  })),
  traction: founderUpdates.map(u => ({
    quarter: u.quarterIndex,
    value: u.actualTraction
  })),
  runway: founderUpdates.map(u => ({
    quarter: u.quarterIndex,
    value: u.actualRunwayMonths
  }))
};
```

### Frontend Display (see `page.tsx:476-488`)
```typescript
<LineChart data={prepareChartData(forecast.revenue, actuals.revenue)}>
  <Line dataKey="forecast" stroke="#3b82f6" /> {/* Blue line */}
  <Line dataKey="actual" stroke="#10b981" dot={{ r: 6, fill: '#10b981' }} /> {/* Green dots */}
</LineChart>
```

---

## 7. Summary: Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FORECAST DATA                             │
├─────────────────────────────────────────────────────────────┤
│ SOURCE: Inline Editor OR Excel Upload                       │
│ STORAGE: Forecast + ForecastMetric tables                   │
│ DISPLAY: Line charts (blue lines)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ACTUAL DATA                               │
├─────────────────────────────────────────────────────────────┤
│ SOURCE: Founder quarterly updates (manual or API)           │
│ STORAGE: FounderUpdate table                                │
│ DISPLAY: Scatter dots (green) on charts                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RUNWAY CALCULATION                        │
├─────────────────────────────────────────────────────────────┤
│ PRIMARY: FounderUpdate.actualRunwayMonths (latest)          │
│ FALLBACK: Investment.calculatedRunwayMonths (from Excel)    │
│ FORMULA: cashAtSnapshot / monthlyBurn                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FLAGS                                     │
├─────────────────────────────────────────────────────────────┤
│ AUTO: Generated when actual < forecast by >20%              │
│ MANUAL: POST /api/flags                                     │
│ COUNT: Displayed in "Active Flags" card                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start Checklist

To fully populate an investment:

1. ✅ **Create Investment** → Investment table populated
2. ✅ **Upload Excel OR Use Inline Editor** → Forecast data populated
3. ✅ **Founder Submits Q1 Update** → Actuals start appearing as dots
4. ✅ **System Checks Forecast vs Actual** → Flags auto-generated if variance > threshold
5. ✅ **Runway Auto-Calculated** → Based on latest actual or Excel data
6. ✅ **ETA Fundraise Auto-Calculated** → Runway - 6 months

---

## API Endpoints Reference

| Action | Endpoint | Method |
|--------|----------|--------|
| Save forecast manually | `/api/investments/:id/forecast/manual` | POST |
| Upload Excel | `/api/templates/import` | POST |
| Submit founder update | `/api/investments/:id/updates` | POST |
| Create manual flag | `/api/flags` | POST |
| Get investment data | `/api/investments/:id` | GET |

---

## Database Schema Quick Reference

```sql
-- Forecasts (from inline editor or Excel)
Forecast { id, investmentId, version, startQuarter, horizonQuarters }
ForecastMetric { id, forecastId, metric, quarterIndex, value }

-- Actuals (from founder updates)
FounderUpdate {
  id, investmentId, quarterIndex,
  actualRevenue, actualBurn, actualRunwayMonths, actualTraction,
  narrativeGood, narrativeBad, narrativeHelp
}

-- Flags (auto-generated or manual)
Flag {
  id, investmentId, type, metric, threshold,
  actualValue, forecastValue, deltaPct, status
}

-- Investment (calculated fields)
Investment {
  calculatedRunwayMonths,  -- From Excel
  cashAtSnapshot,           -- From Excel
  monthlyBurn,              -- From Excel
  expectedLiquidityDate,    -- From Excel or manual
  liquidityExpectation      -- From Excel or manual
}
```
