const { PrismaClient } = require('@prisma/client');
const { extractFacts } = require('./extractor');

const prisma = new PrismaClient();

const FACTS_V1_VERSION = 'v2.0';
const MIN_RUNS_BEFORE_REVIEW = 10;

async function logExtractionRun(runId, investmentId, documentVersionId, documentText, extractionResult) {
  const logEntry = {
    runId,
    timestamp: new Date().toISOString(),
    factsVersion: FACTS_V1_VERSION,
    investmentId,
    documentVersionId,
    documentLength: documentText.length,
    documentPreview: documentText.substring(0, 500),
    
    extraction: {
      totalFacts: extractionResult.facts.length,
      coreFacts: extractionResult.facts.filter(f => f.valueJson?.category === 'core').length,
      optionalFacts: extractionResult.facts.filter(f => f.valueJson?.category === 'optional').length,
      
      factsByType: {},
      factsByConfidence: {},
      derivedFacts: [],
      nullDecisions: []
    },
    
    decisions: [],
    warnings: []
  };

  extractionResult.facts.forEach(fact => {
    const type = fact.factType;
    const confidence = fact.confidence;
    
    logEntry.extraction.factsByType[type] = (logEntry.extraction.factsByType[type] || 0) + 1;
    logEntry.extraction.factsByConfidence[confidence] = (logEntry.extraction.factsByConfidence[confidence] || 0) + 1;
    
    if (fact.valueJson?.derived) {
      logEntry.extraction.derivedFacts.push({
        type: fact.factType,
        value: fact.valueNumber,
        citation: fact.citation,
        confidence: fact.confidence
      });
    }
  });

  const CORE_FACT_TYPES = ['REVENUE', 'ARR', 'CASH_BALANCE', 'RUNWAY_MONTHS', 'HEADCOUNT_CURRENT'];
  const extractedTypes = new Set(extractionResult.facts.map(f => f.factType));
  
  CORE_FACT_TYPES.forEach(type => {
    if (!extractedTypes.has(type)) {
      logEntry.extraction.nullDecisions.push({
        type,
        reason: 'not_found_in_document',
        category: 'core'
      });
      logEntry.decisions.push({
        type: 'null_fact',
        factType: type,
        reason: 'not_found_in_document',
        category: 'core'
      });
    }
  });

  if (logEntry.extraction.derivedFacts.length > 0) {
    logEntry.warnings.push({
      type: 'derived_facts_present',
      count: logEntry.extraction.derivedFacts.length,
      message: 'Some facts were derived rather than explicitly stated'
    });
  }

  if (logEntry.extraction.coreFacts < 3) {
    logEntry.warnings.push({
      type: 'low_core_fact_coverage',
      count: logEntry.extraction.coreFacts,
      message: 'Less than 3 core facts extracted - document may be incomplete'
    });
  }

  return logEntry;
}

async function saveExtractionLog(logEntry) {
  const logContent = JSON.stringify(logEntry, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `extraction-log-${timestamp}.json`;
  
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(__dirname, 'extraction-logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const filepath = path.join(logsDir, filename);
  fs.writeFileSync(filepath, logContent, 'utf8');
  
  console.log(`📝 Extraction log saved: ${filename}`);
  
  return filepath;
}

async function runAgentPipeline(investmentId, documentVersionId, documentText) {
  const runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`AGENT PIPELINE - ${runId}`);
  console.log(`Facts Version: ${FACTS_V1_VERSION} (FROZEN)`);
  console.log(`Investment: ${investmentId}`);
  console.log(`Document: ${documentVersionId}`);
  console.log(`${'='.repeat(70)}`);

  const startTime = Date.now();

  try {
    const facts = await extractFacts(documentText, investmentId, documentVersionId);
    
    const job = await prisma.reviewJob.create({
      data: {
        investmentId,
        status: 'RUNNING',
        promptVersion: FACTS_V1_VERSION,
        idempotencyKey: runId,
        startedAt: new Date()
      }
    });

    for (const fact of facts) {
      await prisma.extractedFact.create({
        data: {
          reviewJobId: job.id,
          documentVersionId,
          ...fact
        }
      });
    }

    await prisma.reviewJob.update({
      where: { id: job.id },
      data: {
        status: 'SUCCEEDED',
        resultJson: {
          factCount: facts.length,
          coreFacts: facts.filter(f => f.valueJson?.category === 'core').length,
          optionalFacts: facts.filter(f => f.valueJson?.category === 'optional').length,
          factTypes: facts.map(f => f.factType),
          runId
        },
        finishedAt: new Date()
      }
    });

    const extractionResult = { facts, job };
    const logEntry = await logExtractionRun(runId, investmentId, documentVersionId, documentText, extractionResult);
    await saveExtractionLog(logEntry);

    const duration = Date.now() - startTime;
    
    console.log(`\n✓ Pipeline complete in ${duration}ms`);
    console.log(`  Total facts: ${facts.length}`);
    console.log(`  Core facts: ${logEntry.extraction.coreFacts}`);
    console.log(`  Optional facts: ${logEntry.extraction.optionalFacts}`);
    console.log(`  Derived facts: ${logEntry.extraction.derivedFacts.length}`);
    console.log(`  Null decisions: ${logEntry.extraction.nullDecisions.length}`);
    
    if (logEntry.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      logEntry.warnings.forEach(w => console.log(`  - ${w.message}`));
    }

    return {
      success: true,
      runId,
      jobId: job.id,
      factCount: facts.length,
      logFile: logEntry.timestamp
    };

  } catch (error) {
    console.error(`\n✗ Pipeline failed:`, error.message);
    
    const errorLog = {
      runId,
      timestamp: new Date().toISOString(),
      factsVersion: FACTS_V1_VERSION,
      investmentId,
      documentVersionId,
      error: {
        message: error.message,
        stack: error.stack
      }
    };
    
    await saveExtractionLog(errorLog);
    
    throw error;
  }
}

async function getRunStats() {
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(__dirname, 'extraction-logs');
  
  if (!fs.existsSync(logsDir)) {
    return { totalRuns: 0, runsUntilReview: MIN_RUNS_BEFORE_REVIEW };
  }
  
  const files = fs.readdirSync(logsDir).filter(f => f.startsWith('extraction-log-') && f.endsWith('.json'));
  const totalRuns = files.length;
  const runsUntilReview = Math.max(0, MIN_RUNS_BEFORE_REVIEW - totalRuns);
  
  return { totalRuns, runsUntilReview };
}

async function analyzeExtractionLogs() {
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(__dirname, 'extraction-logs');
  
  if (!fs.existsSync(logsDir)) {
    console.log('No extraction logs found.');
    return;
  }
  
  const files = fs.readdirSync(logsDir).filter(f => f.startsWith('extraction-log-') && f.endsWith('.json'));
  
  if (files.length < MIN_RUNS_BEFORE_REVIEW) {
    console.log(`\n⏳ Not enough runs for review yet (${files.length}/${MIN_RUNS_BEFORE_REVIEW})`);
    console.log(`   Run ${MIN_RUNS_BEFORE_REVIEW - files.length} more extractions before review.`);
    return;
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`EXTRACTION ANALYSIS - ${files.length} runs`);
  console.log(`Facts Version: ${FACTS_V1_VERSION}`);
  console.log(`${'='.repeat(70)}`);
  
  const analysis = {
    totalRuns: files.length,
    factsByType: {},
    factsByConfidence: {},
    missingCoreFacts: {},
    derivedFactsCount: 0,
    warnings: {},
    lowConfidenceFacts: []
  };
  
  files.forEach(file => {
    const filepath = path.join(logsDir, file);
    const content = fs.readFileSync(filepath, 'utf8');
    const log = JSON.parse(content);
    
    if (log.extraction) {
      Object.entries(log.extraction.factsByType || {}).forEach(([type, count]) => {
        analysis.factsByType[type] = (analysis.factsByType[type] || 0) + count;
      });
      
      Object.entries(log.extraction.factsByConfidence || {}).forEach(([conf, count]) => {
        analysis.factsByConfidence[conf] = (analysis.factsByConfidence[conf] || 0) + count;
      });
      
      log.extraction.nullDecisions?.forEach(decision => {
        if (decision.category === 'core') {
          analysis.missingCoreFacts[decision.type] = (analysis.missingCoreFacts[decision.type] || 0) + 1;
        }
      });
      
      analysis.derivedFactsCount += log.extraction.derivedFacts?.length || 0;
      
      log.warnings?.forEach(warning => {
        const key = warning.type;
        analysis.warnings[key] = (analysis.warnings[key] || 0) + 1;
      });
    }
  });
  
  console.log('\n📊 FACT EXTRACTION FREQUENCY');
  console.log('-'.repeat(70));
  Object.entries(analysis.factsByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / analysis.totalRuns) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
  
  console.log('\n❌ MISSING CORE FACTS (Frequency)');
  console.log('-'.repeat(70));
  Object.entries(analysis.missingCoreFacts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / analysis.totalRuns) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
  
  if (Object.keys(analysis.missingCoreFacts).length === 0) {
    console.log('  ✓ No core facts consistently missing');
  }
  
  console.log('\n📈 CONFIDENCE DISTRIBUTION');
  console.log('-'.repeat(70));
  Object.entries(analysis.factsByConfidence)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .forEach(([conf, count]) => {
      const percentage = ((count / Object.values(analysis.factsByConfidence).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
      console.log(`  ${conf}: ${count} (${percentage}%)`);
    });
  
  console.log('\n⚠️  WARNINGS (Frequency)');
  console.log('-'.repeat(70));
  Object.entries(analysis.warnings)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / analysis.totalRuns) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
  
  console.log(`\n📝 DERIVED FACTS: ${analysis.derivedFactsCount} total`);
  
  console.log('\n' + '='.repeat(70));
  console.log('RECOMMENDATIONS FOR FACTS v2');
  console.log('='.repeat(70));
  
  const recommendations = [];
  
  Object.entries(analysis.missingCoreFacts).forEach(([type, count]) => {
    const percentage = ((count / analysis.totalRuns) * 100).toFixed(1);
    if (percentage > 50) {
      recommendations.push(`Consider making ${type} optional (missing in ${percentage}% of runs)`);
    }
  });
  
  if (analysis.derivedFactsCount > analysis.totalRuns * 0.3) {
    recommendations.push('High number of derived facts - consider improving explicit extraction patterns');
  }
  
  const lowConfidenceRuns = Object.entries(analysis.factsByConfidence)
    .filter(([conf]) => parseFloat(conf) < 0.8)
    .reduce((sum, [, count]) => sum + count, 0);
  
  if (lowConfidenceRuns > analysis.totalRuns * 0.2) {
    recommendations.push('Many low-confidence extractions - review extraction patterns and add validation');
  }
  
  if (recommendations.length === 0) {
    console.log('✓ No major issues detected - Facts v1 is performing well');
  } else {
    recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
  
  return analysis;
}

module.exports = {
  runAgentPipeline,
  getRunStats,
  analyzeExtractionLogs,
  FACTS_V1_VERSION,
  MIN_RUNS_BEFORE_REVIEW
};
