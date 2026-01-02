const { PrismaClient } = require('@prisma/client');
const { runAgentPipeline, getRunStats } = require('./agent-pipeline');

const prisma = new PrismaClient();

const TEST_DOCUMENTS_V2 = [
  {
    name: 'SaaS Co - Pitch Deck',
    content: `
SaaS Co - Series A Pitch

Financial Overview (EUR)

2023 Revenue: €1.5M
2024 Revenue: €2.8M
2025 Revenue: €5.2M (projected)

ARR: €3.0M
Gross Margin: 79%

EBITDA 2024: €420K
Net Profit 2024: €340K

Cash Balance: €2.0M
Monthly Burn: €130K
Runway: 15 months

Headcount: 35 employees
Planned Headcount 2025: 50 employees
    `
  },
  {
    name: 'Traditional Corp - Overview',
    content: `
Traditional Corp - Financial Overview

2024 Revenue: €3.5M
2025 Revenue: €4.2M (forecast)

Gross Margin: 65%

COGS 2024: €1.225M

Cash Balance: €1.8M
Burn Rate: €120K/month

Headcount: 45 employees
    `
  },
  {
    name: 'StartupXYZ - Update',
    content: `
StartupXYZ - Monthly Update

2024 Revenue: €1.2M
ARR: €1.4M

Gross Margin: 82%

Cash Balance: €1.5M
Monthly Burn: €100K
15 months of cash runway

Headcount: 25 employees
    `
  },
  {
    name: 'TechFlow - Board Pack',
    content: `
TechFlow - Q4 Board Pack

Financials (USD)

2023 Revenue: $2.1M
2024 Revenue: $3.8M
2025 Revenue: $5.5M (projected)

ARR: $4.0M
Gross Margin: 76%

EBITDA 2024: $480K
Net Profit 2024: $390K

Cash Balance: $2.2M
Monthly Burn: $140K
Cash runway: 16 months

Headcount: 40 employees
    `
  },
  {
    name: 'ServiceCo - Investor Memo',
    content: `
ServiceCo - Investor Update

Revenue 2024: €2.0M
Revenue 2025: €2.8M (forecast)

Gross Margin: 70%

Cash Balance: €1.4M
Burn: 12 months

Headcount: 30 employees
Planned Headcount 2025: 38 employees
    `
  }
];

async function runFactsV2Tests() {
  console.log('\n' + '='.repeat(70));
  console.log('TESTING FACTS v2.0');
  console.log('='.repeat(70));
  console.log('\nChanges from v1.0:');
  console.log('  1. ARR: core → optional');
  console.log('  2. Runway: enhanced patterns');
  console.log('  3. Everything else: frozen');
  
  const stats = await getRunStats();
  console.log(`\nPrevious runs (v1.0): ${stats.totalRuns}`);
  
  console.log(`\nExecuting ${TEST_DOCUMENTS_V2.length} v2.0 test runs...`);
  
  for (let i = 0; i < TEST_DOCUMENTS_V2.length; i++) {
    const doc = TEST_DOCUMENTS_V2[i];
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`Test ${i + 1}/${TEST_DOCUMENTS_V2.length}: ${doc.name}`);
    console.log('─'.repeat(70));
    
    try {
      const company = await prisma.company.upsert({
        where: { name: doc.name.split(' - ')[0] },
        update: {},
        create: {
          name: doc.name.split(' - ')[0],
          sector: 'SAAS'
        }
      });
      
      const investment = await prisma.investment.upsert({
        where: { id: `test-v2-investment-${i + 1}` },
        update: {},
        create: {
          id: `test-v2-investment-${i + 1}`,
          companyId: company.id,
          status: 'GREEN',
          instrumentType: 'EQUITY'
        }
      });
      
      const document = await prisma.document.create({
        data: {
          title: doc.name,
          docType: 'PITCH_DECK'
        }
      });
      
      const documentVersion = await prisma.documentVersion.create({
        data: {
          documentId: document.id,
          version: 1,
          fileName: `${doc.name.toLowerCase().replace(/ /g, '-')}.txt`,
          mimeType: 'text/plain',
          sizeBytes: BigInt(doc.content.length),
          checksum: `test-v2-${i + 1}-${Date.now()}`,
          storageProvider: 'S3',
          storageKey: `test/${doc.name.toLowerCase().replace(/ /g, '-')}.txt`
        }
      });
      
      const result = await runAgentPipeline(
        investment.id,
        documentVersion.id,
        doc.content
      );
      
      console.log(`✓ Test ${i + 1} complete: ${result.factCount} facts extracted`);
      
    } catch (error) {
      console.error(`✗ Test ${i + 1} failed:`, error.message);
    }
  }
  
  const finalStats = await getRunStats();
  const v2Runs = finalStats.totalRuns - stats.totalRuns;
  
  console.log('\n' + '='.repeat(70));
  console.log('FACTS v2.0 TEST COMPLETE');
  console.log('='.repeat(70));
  console.log(`v1.0 runs: ${stats.totalRuns}`);
  console.log(`v2.0 runs: ${v2Runs}`);
  console.log(`Total runs: ${finalStats.totalRuns}`);
  
  console.log('\n📁 View v2.0 logs:');
  console.log('   ls extraction-logs/ | grep "2026-01-02"');
  
  console.log('\n📊 Compare v1.0 vs v2.0:');
  console.log('   node analyze-core-facts.js');
  
  await prisma.$disconnect();
}

runFactsV2Tests();
