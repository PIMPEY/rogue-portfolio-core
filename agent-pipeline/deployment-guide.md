# Facts v2.0 Deployment Guide

## Quick Start

### 1. Verify Version
```bash
node get-run-stats.js
```
Expected output:
```
Version: v2.0
Total Runs: 15
```

### 2. Run Test Extraction
```javascript
const { runAgentPipeline } = require('./agent-pipeline');

const result = await runAgentPipeline(
  investmentId,
  documentVersionId,
  documentText
);
```

### 3. Check Results
```bash
node analyze-core-facts.js
```

## Production Deployment

### Step 1: Backup Current State
```bash
# Backup extraction logs
cp -r extraction-logs extraction-logs-backup-$(date +%Y%m%d)

# Backup database (if needed)
# Use your database backup tool
```

### Step 2: Deploy Code
```bash
# Facts v2.0 is already implemented
# No code changes needed for deployment
# Version is set to 'v2.0' in agent-pipeline.js
```

### Step 3: Verify Deployment
```bash
# Run a test extraction
node test-facts-v2.js

# Check version in logs
ls extraction-logs/ | tail -1
cat extraction-logs/extraction-log-*.json | grep "factsVersion"
```

Expected output:
```json
"factsVersion": "v2.0"
```

### Step 4: Monitor First 10 Runs
```bash
# Check run count
node get-run-stats.js

# Analyze results
node analyze-core-facts.js

# View individual logs
ls extraction-logs/
cat extraction-logs/extraction-log-*.json
```

## Monitoring

### Daily Checks
```bash
# Check run count
node get-run-stats.js

# Check recent logs
ls -lt extraction-logs/ | head -5
```

### Weekly Analysis (after 20 runs)
```bash
# Full analysis
node analyze-extractions.js

# Core facts analysis
node analyze-core-facts.js
```

### Alert Thresholds
- Core fact coverage < 85%
- High confidence < 85%
- Derived runway rate > 15%
- Extraction failure rate > 5%

## Troubleshooting

### Issue: Low Core Fact Coverage
**Check**: Are documents incomplete?
**Action**: Review null decisions in logs
**Expected**: Some documents will have missing facts

### Issue: High Derived Runway Rate
**Check**: Are runway patterns working?
**Action**: Review runway extraction in logs
**Expected**: < 10% derived runway

### Issue: Low Confidence Scores
**Check**: Are derived facts increasing?
**Action**: Review low confidence facts in logs
**Expected**: Only derived runway should be 0.7

### Issue: Extraction Failures
**Check**: Error logs in extraction-logs/
**Action**: Review error messages
**Expected**: 0 failures

## Rollback Procedure

If issues detected:

### 1. Stop New Extractions
```bash
# Disable extraction endpoint
# Or pause processing
```

### 2. Revert Code
```javascript
// In agent-pipeline.js
const FACTS_V1_VERSION = 'v1.0-frozen';  // Revert from 'v2.0'

// In extractor.js
const CORE_FACT_TYPES = ['REVENUE', 'ARR', 'CASH_BALANCE', 'RUNWAY_MONTHS', 'HEADCOUNT_CURRENT'];  // Add ARR back
```

### 3. Verify Rollback
```bash
node get-run-stats.js
# Should show version: v1.0-frozen
```

### 4. Resume Operations
```bash
# Enable extraction endpoint
# Resume processing
```

## Performance Baseline

### Facts v2.0 Baseline (15 runs)
- **Total Core Facts**: 72
- **High Confidence (≥ 0.85)**: 67 (93.1%)
- **Low Confidence (< 0.8)**: 5 (6.9%)
- **Derived Facts**: 5 (6.9%)
- **Average Runtime**: ~250ms per extraction

### Production Targets
- Maintain ≥ 90% high/good confidence
- Maintain ≤ 10% low confidence
- Maintain ≤ 10% derived facts
- Maintain ≥ 85% core fact coverage
- Maintain < 500ms average runtime

## Support

### Documentation
- `facts-v2-spec.md` - Full specification
- `facts-v2-freeze.md` - Freeze commitment
- `facts-v2-comparison.md` - v1.0 vs v2.0 comparison
- `facts-v1-analysis-report.md` - v1.0 analysis

### Tools
- `get-run-stats.js` - Check run count
- `analyze-extractions.js` - Full analysis
- `analyze-core-facts.js` - Core facts analysis
- `test-facts-v2.js` - Test suite

### Logs
- `extraction-logs/` - JSON logs for each run
- Format: `extraction-log-YYYY-MM-DDTHH-MM-SS-SSSZ.json`

## Contact

For issues or questions:
1. Check documentation
2. Review logs
3. Run analysis tools
4. Check troubleshooting guide

---

**Version**: v2.0
**Status**: Production Ready
**Last Updated**: 2025-01-02
