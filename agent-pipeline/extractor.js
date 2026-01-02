const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CORE_FACT_TYPES = ['REVENUE', 'CASH_BALANCE', 'RUNWAY_MONTHS', 'HEADCOUNT_CURRENT'];
const OPTIONAL_FACT_TYPES = ['ARR', 'COGS', 'GROSS_MARGIN', 'EBITDA', 'NET_PROFIT', 'BURN_MONTHLY', 'HEADCOUNT_PLANNED'];

async function extractFacts(documentText, investmentId, documentVersionId) {
  const facts = [];
  const lines = documentText.split('\n');
  
  let currentYear = null;
  let currentCurrency = 'EUR';
  let cashBalance = null;
  let monthlyBurn = null;
  let cashCitation = null;
  let burnCitation = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const yearMatch = trimmed.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1]);
    }

    const currencyMatch = trimmed.match(/\b(EUR|USD|GBP|CHF)\b/i);
    if (currencyMatch) {
      currentCurrency = currencyMatch[1].toUpperCase();
    }

    if (trimmed.toLowerCase().includes('revenue') && !trimmed.toLowerCase().includes('revenue growth')) {
      const match = trimmed.match(/[\$€£]?\s*([\d,]+(?:\.\d{2})?)/);
      if (match && currentYear) {
        facts.push({
          factType: 'REVENUE',
          valueString: match[1],
          key: `year_${currentYear}`,
          valueJson: { year: currentYear, currency: currentCurrency, category: 'core' },
          citation: trimmed.substring(0, 80),
          confidence: 0.9
        });
      }
    }

    if (trimmed.toLowerCase().includes('arr') && !trimmed.toLowerCase().includes('growth')) {
      const match = trimmed.match(/[\$€£]?\s*([\d,]+(?:\.\d{2})?)/);
      if (match && currentYear) {
        facts.push({
          factType: 'ARR',
          valueString: match[1],
          key: `year_${currentYear}`,
          valueJson: { year: currentYear, currency: currentCurrency, category: 'optional' },
          citation: trimmed.substring(0, 80),
          confidence: 0.9
        });
      }
    }

    if (trimmed.toLowerCase().includes('gross margin') || trimmed.toLowerCase().includes('cogs')) {
      const percentMatch = trimmed.match(/(\d+\.?\d*)\s*%/);
      const valueMatch = trimmed.match(/[\$€£]?\s*([\d,]+(?:\.\d{2})?)/);
      
      if (percentMatch && currentYear) {
        facts.push({
          factType: 'GROSS_MARGIN',
          valueNumber: parseFloat(percentMatch[1]),
          key: `year_${currentYear}`,
          valueJson: { year: currentYear, unit: 'percent', category: 'optional' },
          citation: trimmed.substring(0, 80),
          confidence: 0.85
        });
      } else if (valueMatch && currentYear) {
        facts.push({
          factType: 'COGS',
          valueString: valueMatch[1],
          key: `year_${currentYear}`,
          valueJson: { year: currentYear, currency: currentCurrency, category: 'optional' },
          citation: trimmed.substring(0, 80),
          confidence: 0.85
        });
      }
    }

    if (trimmed.toLowerCase().includes('ebitda') || trimmed.toLowerCase().includes('net profit') || trimmed.toLowerCase().includes('net income')) {
      const match = trimmed.match(/[\$€£]?\s*([\d,]+(?:\.\d{2})?)/);
      if (match && currentYear) {
        const factType = trimmed.toLowerCase().includes('ebitda') ? 'EBITDA' : 'NET_PROFIT';
        facts.push({
          factType,
          valueString: match[1],
          key: `year_${currentYear}`,
          valueJson: { year: currentYear, currency: currentCurrency, category: 'optional' },
          citation: trimmed.substring(0, 80),
          confidence: 0.85
        });
      }
    }

    if (trimmed.toLowerCase().includes('cash balance') || trimmed.toLowerCase().includes('cash on hand')) {
      const match = trimmed.match(/[\$€£]?\s*([\d,]+(?:\.\d{2})?)/);
      if (match) {
        cashBalance = match[1];
        cashCitation = trimmed.substring(0, 80);
        facts.push({
          factType: 'CASH_BALANCE',
          valueString: match[1],
          valueJson: { currency: currentCurrency, category: 'core' },
          citation: cashCitation,
          confidence: 0.9
        });
      }
    }

    if (trimmed.toLowerCase().includes('burn rate') || trimmed.toLowerCase().includes('monthly burn')) {
      const match = trimmed.match(/[\$€£]?\s*([\d,]+(?:\.\d{2})?)/);
      if (match) {
        monthlyBurn = match[1];
        burnCitation = trimmed.substring(0, 80);
        facts.push({
          factType: 'BURN_MONTHLY',
          valueString: match[1],
          valueJson: { currency: currentCurrency, period: 'monthly', category: 'optional' },
          citation: burnCitation,
          confidence: 0.85
        });
      }
    }

    if (trimmed.toLowerCase().includes('runway') || 
        trimmed.toLowerCase().includes('months of cash') ||
        trimmed.toLowerCase().includes('cash runway') ||
        (trimmed.toLowerCase().includes('burn') && trimmed.toLowerCase().includes('months'))) {
      const match = trimmed.match(/(\d+)\s*months?/i);
      if (match) {
        facts.push({
          factType: 'RUNWAY_MONTHS',
          valueNumber: parseFloat(match[1]),
          valueJson: { category: 'core', derived: false },
          citation: trimmed.substring(0, 80),
          confidence: 0.9
        });
      }
    }

    if (trimmed.toLowerCase().includes('headcount') || trimmed.toLowerCase().includes('employees') || trimmed.toLowerCase().includes('fte')) {
      const match = trimmed.match(/(\d+)/);
      if (match) {
        const isPlanned = trimmed.toLowerCase().includes('planned') || trimmed.toLowerCase().includes('target') || trimmed.toLowerCase().includes('forecast');
        const factType = isPlanned ? 'HEADCOUNT_PLANNED' : 'HEADCOUNT_CURRENT';
        const category = isPlanned ? 'optional' : 'core';
        facts.push({
          factType,
          valueNumber: parseFloat(match[1]),
          key: currentYear ? `year_${currentYear}` : null,
          valueJson: currentYear ? { year: currentYear, category } : { category },
          citation: trimmed.substring(0, 80),
          confidence: 0.85
        });
      }
    }
  }

  const hasExplicitRunway = facts.some(f => f.factType === 'RUNWAY_MONTHS' && !f.valueJson?.derived);
  
  if (!hasExplicitRunway && cashBalance && monthlyBurn && cashCitation && burnCitation) {
    const cashNum = parseFloat(cashBalance.replace(/,/g, ''));
    const burnNum = parseFloat(monthlyBurn.replace(/,/g, ''));
    const derivedRunway = Math.round(cashNum / burnNum);
    
    facts.push({
      factType: 'RUNWAY_MONTHS',
      valueNumber: derivedRunway,
      valueJson: { category: 'core', derived: true },
      citation: `Derived: ${cashCitation} + ${burnCitation}`,
      confidence: 0.7
    });
  }

  return facts;
}

async function runExtraction(investmentId, documentVersionId, documentText) {
  const idempotencyKey = `extract-${investmentId}-${documentVersionId}-${Date.now()}`;

  const job = await prisma.reviewJob.create({
    data: {
      investmentId,
      status: 'RUNNING',
      promptVersion: 'v1-thin-slice',
      idempotencyKey,
      startedAt: new Date()
    }
  });

  try {
    const facts = await extractFacts(documentText, investmentId, documentVersionId);

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
        resultJson: { factCount: facts.length, factTypes: facts.map(f => f.factType) },
        finishedAt: new Date()
      }
    });

    return { success: true, factCount: facts.length };
  } catch (error) {
    await prisma.reviewJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        error: error.message,
        finishedAt: new Date()
      }
    });
    throw error;
  }
}

module.exports = { runExtraction, extractFacts };
