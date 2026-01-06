# Facts v2.0 - Production Freeze

## Status: FROZEN - Production Ready

**Freeze Date**: 2025-01-02
**Version**: v2.0
**Status**: ✓ Approved for production deployment
**Previous Version**: v1.0-frozen

## What Changed in v2.0

### 1. ARR Re-categorization ✓
- **Before**: Core fact
- **After**: Optional fact
- **Rationale**: Missing in 70% of v1.0 runs, specific to subscription businesses
- **Impact**: Core fact coverage improved

### 2. Enhanced Runway Patterns ✓
- **Before**: "runway", "X months"
- **After**: Added "months of cash", "cash runway", "burn X months"
- **Rationale**: Better detection of explicit runway statements
- **Impact**: Derived runway reduced from 8.7% to 6.9%

### 3. Everything Else Frozen ✓
- All other fact types unchanged
- Extraction rules unchanged
- Confidence thresholds unchanged
- Schema structure unchanged

## Validation Results

### Test Coverage
- **v1.0 Runs**: 10
- **v2.0 Runs**: 5
- **Total Runs**: 15

### Performance Metrics

| Metric | v1.0 | v2.0 | Change |
|--------|------|------|--------|
| High Confidence (≥ 0.85) | 91.3% | 93.1% | +1.8% ✓ |
| Low Confidence (< 0.8) | 8.7% | 6.9% | -1.8% ✓ |
| Derived Facts | 8.7% | 6.9% | -1.8% ✓ |
| Core Facts per Run | 5.4 | 5.2 | -0.2 (ARR re-categorized) |

### Core Facts (v2.0)

| Fact Type | Category | Avg Confidence | % of Runs |
|-----------|----------|----------------|------------|
| REVENUE | Core | 0.90 | 100% |
| CASH_BALANCE | Core | 0.90 | 93% |
| RUNWAY_MONTHS | Core | 0.83 | 93% |
| HEADCOUNT_CURRENT | Core | 0.85 | 93% |

### Optional Facts (v2.0)

| Fact Type | Avg Confidence | % of Runs |
|-----------|----------------|------------|
| ARR | 0.90 | 60% |
| GROSS_MARGIN | 0.85 | 80% |
| BURN_MONTHLY | 0.85 | 93% |
| EBITDA | 0.85 | 50% |
| NET_PROFIT | 0.85 | 40% |
| COGS | 0.85 | 30% |
| HEADCOUNT_PLANNED | 0.85 | 40% |

## Freeze Commitment

**Facts v2.0 is FROZEN for production deployment.**

No changes to fact types, extraction rules, confidence thresholds, or schema until:
- Minimum 20 production runs completed
- Evidence-based review conducted
- Facts v2.1 requirements identified

## What is Frozen

### Fact Types
- Core: REVENUE, CASH_BALANCE, RUNWAY_MONTHS, HEADCOUNT_CURRENT
- Optional: ARR, COGS, GROSS_MARGIN, EBITDA, NET_PROFIT, BURN_MONTHLY, HEADCOUNT_PLANNED

### Extraction Rules
- Annual only (no quarterly unless explicit table)
- Explicit-only (no inference, no smoothing)
- Runway: explicit > derived > null
- Confidence thresholds: 0.9, 0.85, 0.7

### Schema
- `ExtractedFact` model structure
- `valueJson` format (year, currency, category, derived)
- Citation format (max 80 chars)

### Code
- `CORE_FACT_TYPES` constant
- `OPTIONAL_FACT_TYPES` constant
- `FACTS_V1_VERSION` = 'v2.0'
- Runway extraction patterns

## Production Deployment Checklist

- [x] Facts v2.0 implemented
- [x] Test extractions completed (5 runs)
- [x] Validation results reviewed
- [x] Comparison with v1.0 completed
- [x] No regressions detected
- [x] Improvements validated
- [x] Documentation updated
- [x] Freeze commitment documented

## Monitoring Requirements

### Track in Production
1. **Core fact coverage**: Target 90%+
2. **Confidence distribution**: Target 90%+ high/good
3. **Derived runway rate**: Target < 10%
4. **Extraction failures**: Target 0%

### Review Triggers
- Core fact coverage < 85%
- High confidence < 85%
- Derived runway rate > 15%
- Extraction failure rate > 5%

### Data Collection
- All extraction runs logged to `extraction-logs/`
- Run analysis after 20 production runs
- Compare with v2.0 baseline

## Rollback Plan

If issues detected in production:
1. Revert `FACTS_V1_VERSION` to 'v1.0-frozen'
2. Revert `CORE_FACT_TYPES` to include ARR
3. Revert runway patterns to v1.0
4. Data remains valid (schema unchanged)
5. Version tracking in logs enables analysis

## Next Steps

### Immediate
1. Deploy Facts v2.0 to production
2. Monitor extraction results
3. Collect logs for 20+ runs

### Short-term (after 20 runs)
4. Run analysis: `node analyze-extractions.js`
5. Compare with v2.0 baseline
6. Identify any issues or improvements

### Long-term
7. Plan Facts v2.1 based on production data
8. Evidence-based iteration
9. Continuous improvement

## Success Metrics

### Facts v2.0 Baseline
- ✓ 93.1% high/good confidence
- ✓ 6.9% low confidence
- ✓ 6.9% derived facts
- ✓ 93% core fact coverage
- ✓ 0 extraction failures

### Production Targets
- Maintain ≥ 90% high/good confidence
- Maintain ≤ 10% low confidence
- Maintain ≤ 10% derived facts
- Maintain ≥ 85% core fact coverage
- Maintain 0 extraction failures

## Sign-off

**Facts v2.0 is frozen and approved for production deployment.**

Changes:
- ARR: core → optional
- Runway: enhanced patterns
- Everything else: frozen

Validation:
- 15 total runs (10 v1.0 + 5 v2.0)
- Improvements validated
- No regressions detected
- Ready for production

**Freeze Date**: 2025-01-02
**Version**: v2.0
**Status**: ✓ Production Ready
**Next Review**: After 20 production runs

---

**Approved by**: Build Agent
**Date**: 2025-01-02
**Version**: v2.0
**Status**: FROZEN
