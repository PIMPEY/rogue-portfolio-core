import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

function createBlankTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Field Name', 'Value'],
    ['Company Name', ''],
    ['Sector', ''],
    ['Stage', ''],
    ['Investment Type', ''],
    ['Currency', ''],
    ['Committed Capital (Local)', ''],
    ['Ownership %', ''],
    ['Entry Valuation', ''],
    ['isPostMoney', false],
    ['Snapshot Date', ''],
    ['Cash at Snapshot', ''],
    ['Monthly Burn', ''],
    ['Customers at Snapshot', ''],
    ['Expected Liquidity Year', ''],
    ['Expected Liquidity Valuation', ''],
    ['Expected Liquidity Type', '']
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Sheet 2: Projections
  const projectionsData = [
    ['Metric', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
    ['Revenue', 0, 0, 0, 0, 0],
    ['COGS', 0, 0, 0, 0, 0],
    ['Opex', 0, 0, 0, 0, 0],
    ['EBITDA', 0, 0, 0, 0, 0]
  ];

  const projectionsSheet = XLSX.utils.aoa_to_sheet(projectionsData);
  XLSX.utils.book_append_sheet(wb, projectionsSheet, 'Projections');

  return wb;
}

function createSampleTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Field Name', 'Value'],
    ['Company Name', 'TechStartup Inc.'],
    ['Sector', 'SaaS'],
    ['Stage', 'Seed'],
    ['Investment Type', 'Equity'],
    ['Currency', 'USD'],
    ['Committed Capital (Local)', 500000],
    ['Ownership %', 15],
    ['Entry Valuation', 3000000],
    ['isPostMoney', true],
    ['Snapshot Date', '2024-01-15'],
    ['Cash at Snapshot', 800000],
    ['Monthly Burn', 50000],
    ['Customers at Snapshot', 25],
    ['Expected Liquidity Year', 3],
    ['Expected Liquidity Valuation', 15000000],
    ['Expected Liquidity Type', 'M&A']
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Sheet 2: Projections
  const projectionsData = [
    ['Metric', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
    ['Revenue', 100000, 300000, 800000, 2000000, 5000000],
    ['COGS', 20000, 60000, 160000, 400000, 1000000],
    ['Opex', 600000, 800000, 1200000, 1800000, 2500000],
    ['EBITDA', -520000, -560000, -560000, -200000, 1500000]
  ];

  const projectionsSheet = XLSX.utils.aoa_to_sheet(projectionsData);
  XLSX.utils.book_append_sheet(wb, projectionsSheet, 'Projections');

  return wb;
}

function createInstructionsTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Field Name', 'Value', 'Instructions'],
    ['Company Name', 'Example Co', 'Company name (text)'],
    ['Sector', 'SaaS', 'Industry sector (text)'],
    ['Stage', 'Seed', 'Investment stage (Pre-Seed, Seed, Series A, etc.)'],
    ['Investment Type', 'Equity', 'Type of investment (Equity, SAFE, CLN, etc.)'],
    ['Currency', 'USD', 'Currency code (USD, EUR, GBP, etc.)'],
    ['Committed Capital (Local)', 500000, 'Amount committed in local currency (number)'],
    ['Ownership %', 15, 'Ownership percentage (number, 0-100)'],
    ['Entry Valuation', 3000000, 'Pre/Post-money valuation at entry (number)'],
    ['isPostMoney', 'true', 'Is valuation post-money? (true/false)'],
    ['Snapshot Date', '2024-01-15', 'Date of snapshot (YYYY-MM-DD)'],
    ['Cash at Snapshot', 800000, 'Cash balance at snapshot date (number)'],
    ['Monthly Burn', 50000, 'Monthly burn rate (number, required if Y1 revenue = 0 OR Y1 EBITDA < 0)'],
    ['Customers at Snapshot', 25, 'Number of customers at snapshot (integer)'],
    ['Expected Liquidity Year', 3, 'Expected liquidity year (1-5, relative to investment)'],
    ['Expected Liquidity Valuation', 15000000, 'Expected exit valuation (number)'],
    ['Expected Liquidity Type', 'M&A', 'Type of exit (M&A, IPO, Secondary, etc.)']
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Sheet 2: Projections
  const projectionsData = [
    ['Metric', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Instructions'],
    ['Revenue', 100000, 300000, 800000, 2000000, 5000000, 'Annual revenue projection (5 years required, no ARR row)'],
    ['COGS', 20000, 60000, 160000, 400000, 1000000, 'Annual cost of goods sold (5 years required)'],
    ['Opex', 600000, 800000, 1200000, 1800000, 2500000, 'Annual operating expenses (5 years required)'],
    ['EBITDA', -520000, -560000, -560000, -200000, 1500000, 'Annual EBITDA (5 years required)']
  ];

  const projectionsSheet = XLSX.utils.aoa_to_sheet(projectionsData);
  XLSX.utils.book_append_sheet(wb, projectionsSheet, 'Projections');

  return wb;
}

// Generate all templates
const outputDir = path.join(__dirname, '../../templates');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating Excel templates...');

const blankTemplate = createBlankTemplate();
XLSX.writeFile(blankTemplate, path.join(outputDir, 'Investment_Template_Empty.xlsx'));
console.log('✓ Created Investment_Template_Empty.xlsx');

const sampleTemplate = createSampleTemplate();
XLSX.writeFile(sampleTemplate, path.join(outputDir, 'Investment_Template_Sample.xlsx'));
console.log('✓ Created Investment_Template_Sample.xlsx');

const instructionsTemplate = createInstructionsTemplate();
XLSX.writeFile(instructionsTemplate, path.join(outputDir, 'Investment_Template_Instructions.xlsx'));
console.log('✓ Created Investment_Template_Instructions.xlsx');

console.log(`\nTemplates generated in: ${outputDir}`);
