# Facts v2 Specification

## Version
- **Version**: v2.0
- **Date**: 2025-01-02
- **Status**: Active
- **Previous Version**: v1.0-frozen

## Changes from v1.0

### 1. ARR Re-categorization (Approved)
- **v1.0**: Core fact
- **v2.0**: Optional fact
- **Rationale**: Missing in 70% of runs, specific to subscription businesses

### 2. Enhanced Runway Patterns (Minor)
- **v1.0**: "runway", "X months"
- **v2.0**: Added patterns:
  - "months of cash"
  - "cash runway"
  - "burn X months"

### 3. Everything Else Frozen
- All other fact types unchanged
- Extraction rules unchanged
- Confidence thresholds unchanged
- Schema structure unchanged

## Core Facts (v2.0)

| Fact Type | Description | Required Fields |
|-----------|-------------|-----------------|
| REVENUE | Annual revenue | year, currency, value |
| CASH_BALANCE | Current cash position | currency, value |
| RUNWAY_MONTHS | Months of runway | value (number) |
| HEADCOUNT_CURRENT | Current employee count | value (number) |

## Optional Facts (v2.0)

| Fact Type | Description | Required Fields |
|-----------|-------------|-----------------|
| ARR | Annual recurring revenue | year, currency, value |
| COGS | Cost of goods sold | year, currency, value |
| GROSS_MARGIN | Gross margin percentage | year, value (percent) |
| EBITDA | Earnings before interest, taxes, depreciation, amortization | year, currency, value |
| NET_PROFIT | Net income/profit | year, currency, value |
| BURN_MONTHLY | Monthly cash burn | currency, value |
| HEADCOUNT_PLANNED | Target/forecasted headcount | year, value (number) |

## Extraction Rules (Unchanged from v1.0)

### Annual Only
- Extract annual figures only
- Quarterly only if explicit table present
- No inference or smoothing

### Explicit Only
- Extract only what's explicitly stated
- Return null for missing data
- No guessing or filling gaps

### Runway Rules
1. **Explicit statement** (confidence 0.9)
   - "Runway: 15 months"
   - "15 months of runway"
   - "Cash runway: 15 months"
   - "Burn: 15 months"

2. **Derived from cash + burn** (confidence 0.7)
   - Only when both cash and monthly burn are present
   - Must be same currency
   - Citation includes both sources

3. **Return null**
   - Only cash present (no burn)
   - Only burn present (no cash)
   - Different currencies
   - Annual burn (not monthly)

## Confidence Thresholds (Unchanged)

| Confidence | Use Case |
|------------|----------|
| 0.9 | Explicit statements (revenue, cash, runway, headcount) |
| 0.85 | Financial metrics (gross margin, EBITDA, burn) |
| 0.7 | Derived facts (runway from cash + burn) |

## Schema (Unchanged)

```prisma
model ExtractedFact {
  id              String          @id @default(cuid())
  reviewJobId     String
  documentVersionId String?

  factType        String          // e.g., "REVENUE", "ARR", "RUNWAY_MONTHS"
  key             String?
  valueString     String?
  valueNumber     Decimal?        @db.Decimal(18, 6)
  valueJson       Json?           // { year, currency, category, derived }
  confidence      Decimal?        @db.Decimal(4, 3)
  citation        String?         // "Slide 12", "Page 3", etc.
  createdAt       DateTime        @default(now())

  reviewJob       ReviewJob       @relation(fields: [reviewJobId], references: [id], onDelete: Cascade)
  documentVersion DocumentVersion? @relation(fields: [documentVersionId], references: [id], onDelete: SetNull)

  @@index([reviewJobId])
  @@index([factType])
}
```

## Testing

### Test Results (v1.0 → v2.0)
- **v1.0**: 10 runs, ARR missing in 70%
- **v2.0**: Expected improvement in core fact coverage
- **Target**: 90%+ core fact coverage

### Validation
- Run 10 test extractions with v2.0
- Compare core fact coverage vs v1.0
- Verify runway pattern improvements
- Confirm no regression in other fact types

## Migration

### Database
- No schema changes required
- Existing data compatible
- Category field in `valueJson` updated automatically

### Code
- Update `CORE_FACT_TYPES` constant
- Update `FACTS_V1_VERSION` to 'v2.0'
- Add runway patterns
- No other code changes

### Rollback
- Can rollback to v1.0 if needed
- Data remains valid
- Version tracking in logs

## Next Steps

1. ✓ Implement v2.0 changes
2. Run 10 test extractions
3. Analyze results
4. Compare v1.0 vs v2.0 performance
5. Decide on v2.1 or freeze v2.0

## Sign-off

**Facts v2.0 approved for limited deployment.**

Changes:
- ARR: core → optional
- Runway: enhanced patterns
- Everything else: frozen

Date: 2025-01-02
Version: v2.0
Status: Active
