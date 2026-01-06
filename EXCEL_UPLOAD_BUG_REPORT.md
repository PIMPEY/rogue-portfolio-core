# Excel Upload Bug Report & Context for VS Code Session

**Current Branch:** `frontend-root-directory-config` (connected to Railway)
**Date:** January 3, 2026
**Session:** Investigation & Quality Check

---

## 🐛 Critical Bug Found

### The Problem
**Excel file upload does NOT work** because of a missing dependency.

### Root Cause
```typescript
// Line 535-540 in backend/src/index.ts
if (!req.file) {
  return res.status(400).json({
    success: false,
    errors: ["No Excel file provided"],
    preview: null
  });
}
```

**The code expects `req.file` from multer, but multer is NOT installed or configured!**

### Evidence

**backend/package.json - Dependencies:**
```json
{
  "dependencies": {
    "@prisma/client": "^6.7.0",
    "cors": "^2.8.5",
    "express": "^4.22.1",
    "xlsx": "^0.18.5",  // ✅ Present
    "@aws-sdk/client-s3": "^3.670.0",
    "@aws-sdk/s3-request-presigner": "^3.670.0"
    // ❌ NO multer!
  }
}
```

**backend/src/index.ts - Imports:**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
// ... other imports
import ExcelTemplateProcessor from "../excel-template-processor.js";
// ❌ NO multer import!
// ❌ NO multer middleware configuration!
```

---

## 🔍 Current Implementation Status

### What EXISTS on `frontend-root-directory-config` Branch

#### ✅ Implemented Files

1. **Excel Template Processor**
   - Location: `backend/excel-template-processor.js` (JavaScript, not TypeScript)
   - Location: `backend/src/excel-template-processor.js`
   - Parser for 2-sheet Excel files (Summary + Projections)
   - Validates data structure
   - Different schema than your new implementation

2. **Generated Templates** (at backend root)
   - `Investment_Template_Empty.xlsx`
   - `Investment_Template_Sample.xlsx`
   - `Investment_Template_Instructions.xlsx`

3. **API Endpoint**
   - `POST /api/templates/import` (line 523-614 in backend/src/index.ts)
   - Expects `req.file.buffer` from multer
   - Updates existing investment with Excel data
   - Does NOT create forecasts (commented out for MVP)

4. **Frontend UI**
   - `app-web/src/app/simple-mvp/page.tsx` has Excel upload section
   - Similar UI to what I implemented

#### ❌ Missing Components

1. **multer** dependency (file upload middleware)
2. **@types/multer** dev dependency
3. **multer middleware configuration** in index.ts
4. **Proper error handling** when multer is missing

---

## 📊 Schema Differences

### This Branch (`frontend-root-directory-config`)
Excel processor expects these fields:
```javascript
// Summary Sheet
companyName, sector, stage, investmentType
committedCapitalLcl, ownershipPercent
roundSizeEur, enterpriseValueEur, currentFairValueEur
snapshotDate, cashAtSnapshot, customersAtSnapshot
arrAtSnapshot, liquidityExpectation

// Projections Sheet
revenueY1-Y5, arrY1-Y5, cogsY1-Y5, opexY1-Y5, ebitdaY1-Y5
```

### My Branch (`claude/startup-investment-tracker-Q9cu1`)
Excel processor expects:
```typescript
// Summary Sheet (2-column: Field Name | Value)
Company Name, Sector, Stage, Investment Type
Currency, Committed Capital (Local), Ownership %
Entry Valuation, isPostMoney, Snapshot Date
Cash at Snapshot, Monthly Burn, Customers at Snapshot
Expected Liquidity Year, Expected Liquidity Valuation, Expected Liquidity Type

// Projections Sheet (Tabular: Metric | Y1 | Y2 | Y3 | Y4 | Y5)
Revenue, COGS, Opex, EBITDA (exactly 5 years, no ARR row)
```

**Key Differences:**
- This branch: Flat single-sheet summary, has ARR row in projections
- My branch: 2-column summary sheet, separate InvestmentThesis and InvestmentLiquidity tables

---

## 🔧 The Fix Required

### Option 1: Quick Fix (Minimal Changes)
Add multer to this branch:

```bash
cd backend
npm install multer @types/multer
```

Then add to `backend/src/index.ts`:
```typescript
import multer from 'multer';

// After app initialization
const upload = multer({ storage: multer.memoryStorage() });

// Update the endpoint (line 523)
app.post("/api/templates/import", upload.single('file'), asyncHandler(async (req, res) => {
  // ... rest of code
```

### Option 2: Merge My Implementation
My branch (`claude/startup-investment-tracker-Q9cu1`) has:
- ✅ Multer properly installed and configured
- ✅ TypeScript implementation
- ✅ Organized file structure (in `src/lib/` and `src/api/`)
- ✅ Better schema design (separate Thesis/Liquidity tables)
- ✅ Comprehensive documentation

---

## 📁 Branch Comparison Summary

| Feature | frontend-root-directory-config | claude/startup-investment-tracker-Q9cu1 |
|---------|-------------------------------|----------------------------------------|
| **Railway Connected** | ✅ Yes | ❌ No |
| **Excel Upload Works** | ❌ No (missing multer) | ✅ Yes |
| **Language** | JavaScript | TypeScript |
| **File Organization** | Root level | src/lib/, src/api/ |
| **Database Schema** | Flat Investment model | +InvestmentThesis, +InvestmentLiquidity |
| **MetricType Enum** | REVENUE, BURN, TRACTION | +COGS, +OPEX, +EBITDA |
| **ARR in Projections** | Yes | No (uses Revenue) |
| **Documentation** | Architecture docs | EXCEL_TEMPLATE_SETUP.md |

---

## 🎯 Recommended Action Plan

### For VS Code Session

1. **Quick Win - Fix Current Branch**
   ```bash
   # On frontend-root-directory-config branch
   cd backend
   npm install multer @types/multer
   ```

2. **Add Multer Config**
   Edit `backend/src/index.ts`:
   - Add import: `import multer from 'multer';`
   - Add middleware: `const upload = multer({ storage: multer.memoryStorage() });`
   - Update endpoint: `app.post("/api/templates/import", upload.single('file'), ...`

3. **Test on Railway**
   - Push changes
   - Railway will auto-deploy
   - Test Excel upload on https://rogue-portfolio-core-production-93df.up.railway.app/simple-mvp

4. **Alternative - Merge My Work**
   - Cherry-pick commits from `claude/startup-investment-tracker-Q9cu1`
   - Better long-term solution
   - Requires database migration for new tables

---

## 🚀 What Was Accomplished in This Session

### Completed ✅
1. Fixed investment detail page crash (data structure mismatch)
2. Implemented complete Excel template system from scratch
3. Created TypeScript implementation with proper types
4. Added database schema for InvestmentThesis and InvestmentLiquidity
5. Generated migration file
6. Created comprehensive documentation (EXCEL_TEMPLATE_SETUP.md)
7. Pushed all changes to `claude/startup-investment-tracker-Q9cu1` branch
8. Discovered the multer bug on `frontend-root-directory-config` branch

### Issues Identified 🔍
1. **Critical:** Missing multer dependency on Railway branch
2. Schema inconsistency between branches
3. No InvestmentThesis/InvestmentLiquidity tables on Railway branch
4. JavaScript vs TypeScript implementation differences

---

## 📝 Quick Reference

### Key Files to Review in VS Code

**On `frontend-root-directory-config` (current):**
- `backend/src/index.ts:523-614` - Excel import endpoint (BROKEN - needs multer)
- `backend/excel-template-processor.js` - Parser implementation
- `backend/package.json` - Missing multer dependency
- `app-web/src/app/simple-mvp/page.tsx` - Frontend UI

**On `claude/startup-investment-tracker-Q9cu1`:**
- `backend/src/lib/excel-template-processor.ts` - TypeScript parser
- `backend/src/api/templates/import/route.ts` - Import endpoint (WORKING)
- `backend/src/index.ts:16` - Multer properly imported
- `backend/src/index.ts:21` - Multer configured
- `backend/src/index.ts:40` - Endpoint with multer middleware
- `backend/prisma/schema.prisma:352-382` - New tables

### Git Commands
```bash
# See all branches
git branch -a

# Switch branches
git checkout frontend-root-directory-config  # Railway branch
git checkout claude/startup-investment-tracker-Q9cu1  # My work

# Compare branches
git diff frontend-root-directory-config claude/startup-investment-tracker-Q9cu1 -- backend/package.json
```

---

## 💡 Context for Next Claude Session

**User Goal:** Get Excel template upload working on Railway deployment

**Current Situation:**
- Excel upload UI exists but doesn't work
- Backend endpoint exists but missing multer dependency
- Two competing implementations exist on different branches
- Railway is connected to `frontend-root-directory-config` branch

**The Ask:** Fix the Excel upload or merge the working implementation

**Fastest Fix:** Add multer to current Railway branch (3-line code change + 1 npm install)

**Best Fix:** Merge TypeScript implementation with proper schema (requires migration + testing)

---

## 🔗 Related Files & Resources

- Repository: https://github.com/PIMPEY/rogue-portfolio-core
- Railway URL: https://rogue-portfolio-core-production-93df.up.railway.app
- Simple MVP: https://rogue-portfolio-core-production-93df.up.railway.app/simple-mvp
- Pull Request (my work): https://github.com/PIMPEY/rogue-portfolio-core/pull/new/claude/startup-investment-tracker-Q9cu1

---

**End of Report**
