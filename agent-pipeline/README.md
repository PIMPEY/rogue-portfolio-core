# Agent Pipeline - Financial Facts Extraction

## Quick Start

```bash
# Check run stats
node get-run-stats.js

# Run extraction
const { runAgentPipeline } = require('./agent-pipeline');
await runAgentPipeline(investmentId, documentVersionId, documentText);

# Analyze results
node analyze-core-facts.js
```

## Version

**Current Version**: v2.0 (Production Ready)
**Status**: ✓ Frozen
**Date**: 2025-01-02

## What It Does

Extracts financial facts from documents with high confidence and strong provenance.

### Core Facts (Must Extract if Present)
- REVENUE (annual)
- CASH_BALANCE
- RUNWAY_MONTHS
- HEADCOUNT_CURRENT

### Optional Facts (Extract if Present)
- ARR
- COGS
- GROSS_MARGIN
- EBITDA
- NET_PROFIT
- BURN_MONTHLY
- HEADCOUNT_PLANNED

## Performance

- **Confidence**: 93.1% high/good (≥ 0.85)
- **Coverage**: 93% core facts
- **Runtime**: ~250ms per extraction
- **Success Rate**: 100%

## Architecture

```
Document → Extractor → Facts → Database → Logs
                ↓
         Regex Patterns
         (explicit-only)
```

## Key Features

- ✓ Explicit-only extraction (no hallucinations)
- ✓ Confidence scores (0.7-0.9)
- ✓ Provenance tracking (citations, sources)
- ✓ Core vs optional categorization
- ✓ Comprehensive logging
- ✓ Evidence-based iteration

## Documentation

- `facts-v2-spec.md` - Full specification
- `facts-v2-freeze.md` - Freeze commitment
- `facts-v2-comparison.md` - v1.0 vs v2.0
- `deployment-guide.md` - Deployment instructions
- `project-summary.md` - Complete project summary

## Tools

- `get-run-stats.js` - Check run count
- `analyze-extractions.js` - Full analysis
- `analyze-core-facts.js` - Core facts confidence
- `test-facts-v2.js` - Test suite

## Logs

All extractions logged to `extraction-logs/` as JSON.

## License

Internal use only.

---

**Built**: 2025-01-02
**Version**: v2.0
**Status**: Production Ready
