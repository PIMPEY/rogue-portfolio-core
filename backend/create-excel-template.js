const XLSX = require('xlsx');

// Create the official Excel template for investment data import
function createExcelTemplate() {
  console.log('📊 Creating Excel Template...');
  
  // Summary Sheet Data
  const summaryData = [
    ['Field', 'Value', 'Description'],
    ['Company Name', '', 'Name of the company'],
    ['Sector', '', 'Industry sector (e.g., SAAS, FINTECH, AI_INFRA, MEDTECH, HEALTHCARE, CLIMATE, CONSUMER, INDUSTRIAL, OTHER)'],
    ['Stage', '', 'Investment stage (e.g., PRE_SEED, SEED, SERIES_A, SERIES_B, SERIES_C, SERIES_D_PLUS, GROWTH, OTHER)'],
    ['Investment Type', '', 'Type of investment (e.g., SAFE, CLN, EQUITY, OTHER)'],
    ['Committed Capital (Local)', '', 'Total committed capital in local currency'],
    ['Ownership %', '', 'Percentage ownership (e.g., 15.5 for 15.5%)'],
    ['Round Size (EUR)', '', 'Total round size in EUR'],
    ['Enterprise Value (EUR)', '', 'Enterprise value in EUR'],
    ['Current Fair Value (EUR)', '', 'Current fair value in EUR'],
    ['Snapshot Date', '', 'Date of the financial snapshot (YYYY-MM-DD format)'],
    ['Cash at Snapshot', '', 'Cash balance at snapshot date'],
    ['Customers at Snapshot', '', 'Number of customers at snapshot date'],
    ['ARR at Snapshot', '', 'Annual Recurring Revenue at snapshot date'],
    ['Liquidity Expectation', '', 'Description of expected liquidity event'],
    ['Expected Liquidity Date', '', 'Expected date of liquidity event (YYYY-MM-DD format)'],
    ['Expected Liquidity Multiple', '', 'Expected return multiple (e.g., 3.0 for 3x)'],
    ['Monthly Burn', '', 'Monthly cash burn rate (REQUIRED if Y1 Revenue = 0 or Y1 EBITDA < 0)']
  ];

  // Projections Sheet Data
  const projectionsData = [
    ['Metric', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Description'],
    ['Revenue', '', '', '', '', '', 'Annual revenue projection'],
    ['ARR', '', '', '', '', '', 'Annual Recurring Revenue projection'],
    ['COGS', '', '', '', '', '', 'Cost of Goods Sold projection'],
    ['Opex', '', '', '', '', '', 'Operating Expenses projection'],
    ['EBITDA', '', '', '', '', '', 'EBITDA projection (negative values will trigger runway calculation)']
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add Summary sheet with formatting
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths for Summary sheet
  summaryWs['!cols'] = [
    { width: 25 },  // Field column
    { width: 20 },  // Value column
    { width: 50 }   // Description column
  ];
  
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Add Projections sheet with formatting
  const projectionsWs = XLSX.utils.aoa_to_sheet(projectionsData);
  
  // Set column widths for Projections sheet
  projectionsWs['!cols'] = [
    { width: 20 },  // Metric column
    { width: 12 },  // Y1 column
    { width: 12 },  // Y2 column
    { width: 12 },  // Y3 column
    { width: 12 },  // Y4 column
    { width: 12 },  // Y5 column
    { width: 40 }   // Description column
  ];
  
  XLSX.utils.book_append_sheet(wb, projectionsWs, 'Projections');

  return wb;
}

// Create template with sample data for demonstration
function createSampleTemplate() {
  console.log('📊 Creating Sample Excel Template...');
  
  // Summary Sheet Data with sample values
  const summaryData = [
    ['Field', 'Value', 'Description'],
    ['Company Name', 'TechCorp Solutions', 'Name of the company'],
    ['Sector', 'SAAS', 'Industry sector (e.g., SAAS, FINTECH, AI_INFRA, MEDTECH, HEALTHCARE, CLIMATE, CONSUMER, INDUSTRIAL, OTHER)'],
    ['Stage', 'SEED', 'Investment stage (e.g., PRE_SEED, SEED, SERIES_A, SERIES_B, SERIES_C, SERIES_D_PLUS, GROWTH, OTHER)'],
    ['Investment Type', 'EQUITY', 'Type of investment (e.g., SAFE, CLN, EQUITY, OTHER)'],
    ['Committed Capital (Local)', 1000000, 'Total committed capital in local currency'],
    ['Ownership %', 15.5, 'Percentage ownership (e.g., 15.5 for 15.5%)'],
    ['Round Size (EUR)', 2000000, 'Total round size in EUR'],
    ['Enterprise Value (EUR)', 12000000, 'Enterprise value in EUR'],
    ['Current Fair Value (EUR)', 1500000, 'Current fair value in EUR'],
    ['Snapshot Date', '2024-01-01', 'Date of the financial snapshot (YYYY-MM-DD format)'],
    ['Cash at Snapshot', 500000, 'Cash balance at snapshot date'],
    ['Customers at Snapshot', 150, 'Number of customers at snapshot date'],
    ['ARR at Snapshot', 800000, 'Annual Recurring Revenue at snapshot date'],
    ['Liquidity Expectation', 'Series A in 18 months', 'Description of expected liquidity event'],
    ['Expected Liquidity Date', '2025-07-01', 'Expected date of liquidity event (YYYY-MM-DD format)'],
    ['Expected Liquidity Multiple', 3.0, 'Expected return multiple (e.g., 3.0 for 3x)'],
    ['Monthly Burn', 75000, 'Monthly cash burn rate (REQUIRED if Y1 Revenue = 0 or Y1 EBITDA < 0)']
  ];

  // Projections Sheet Data with sample values
  const projectionsData = [
    ['Metric', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Description'],
    ['Revenue', 1200000, 2400000, 4800000, 8400000, 14000000, 'Annual revenue projection'],
    ['ARR', 1200000, 2400000, 4800000, 8400000, 14000000, 'Annual Recurring Revenue projection'],
    ['COGS', 240000, 480000, 960000, 1680000, 2800000, 'Cost of Goods Sold projection'],
    ['Opex', 1800000, 2400000, 3600000, 4800000, 6000000, 'Operating Expenses projection'],
    ['EBITDA', -840000, -480000, 240000, 1920000, 5200000, 'EBITDA projection (negative values will trigger runway calculation)']
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add Summary sheet
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [
    { width: 25 },  // Field column
    { width: 20 },  // Value column
    { width: 50 }   // Description column
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Add Projections sheet
  const projectionsWs = XLSX.utils.aoa_to_sheet(projectionsData);
  projectionsWs['!cols'] = [
    { width: 20 },  // Metric column
    { width: 12 },  // Y1 column
    { width: 12 },  // Y2 column
    { width: 12 },  // Y3 column
    { width: 12 },  // Y4 column
    { width: 12 },  // Y5 column
    { width: 40 }   // Description column
  ];
  XLSX.utils.book_append_sheet(wb, projectionsWs, 'Projections');

  return wb;
}

// Create instructions sheet
function createInstructionsSheet() {
  const instructionsData = [
    ['Investment Data Import Template - Instructions'],
    [''],
    ['OVERVIEW'],
    ['This Excel template is used to import investment data into the portfolio management system.'],
    ['Fill out both sheets (Summary and Projections) with your investment data.'],
    [''],
    ['VALIDATION RULES'],
    ['• Company Name is required'],
    ['• All Summary sheet fields marked as required must be filled'],
    ['• Runway calculation is REQUIRED when:'],
    ['  - Y1 Revenue is 0, blank, or null OR'],
    ['  - Y1 EBITDA is negative'],
    ['• When runway is required, Monthly Burn and Snapshot Date must be provided'],
    [''],
    ['FIELD DESCRIPTIONS'],
    [''],
    ['SUMMARY SHEET:'],
    ['• Company Name: Full legal name of the company'],
    ['• Sector: Industry classification (SAAS, FINTECH, AI_INFRA, MEDTECH, HEALTHCARE, CLIMATE, CONSUMER, INDUSTRIAL, OTHER)'],
    ['• Stage: Investment stage (PRE_SEED, SEED, SERIES_A, SERIES_B, SERIES_C, SERIES_D_PLUS, GROWTH, OTHER)'],
    ['• Investment Type: Type of instrument (SAFE, CLN, EQUITY, OTHER)'],
    ['• Committed Capital (Local): Total committed amount in original currency'],
    ['• Ownership %: Percentage equity ownership (e.g., 15.5 for 15.5%)'],
    ['• Round Size (EUR): Total round size converted to EUR'],
    ['• Enterprise Value (EUR): Company valuation in EUR'],
    ['• Current Fair Value (EUR): Current fair market value in EUR'],
    ['• Snapshot Date: Date of the financial snapshot (YYYY-MM-DD)'],
    ['• Cash at Snapshot: Cash balance at snapshot date'],
    ['• Customers at Snapshot: Number of customers at snapshot date'],
    ['• ARR at Snapshot: Annual Recurring Revenue at snapshot date'],
    ['• Liquidity Expectation: Description of expected exit/liquidity event'],
    ['• Expected Liquidity Date: Expected date of liquidity event (YYYY-MM-DD)'],
    ['• Expected Liquidity Multiple: Expected return multiple (e.g., 3.0 for 3x)'],
    ['• Monthly Burn: Monthly cash burn rate (required for runway calculation)'],
    [''],
    ['PROJECTIONS SHEET:'],
    ['• Revenue: Annual revenue projections for years 1-5'],
    ['• ARR: Annual Recurring Revenue projections for years 1-5'],
    ['• COGS: Cost of Goods Sold projections for years 1-5'],
    ['• Opex: Operating Expenses projections for years 1-5'],
    ['• EBITDA: EBITDA projections for years 1-5 (negative values trigger runway calculation)'],
    [''],
    ['RUNWAY CALCULATION'],
    ['Runway is automatically calculated when Y1 Revenue = 0/blank OR Y1 EBITDA < 0'],
    ['Formula: Cash at Snapshot ÷ Monthly Burn'],
    ['Uses months between Snapshot Date and today for calculation context'],
    [''],
    ['SUBMISSION'],
    ['Upload this completed Excel file to: POST /api/templates/import'],
    ['The system will validate data and create investment records with forecast data']
  ];

  const ws = XLSX.utils.aoa_to_sheet(instructionsData);
  ws['!cols'] = [{ width: 80 }];
  
  return ws;
}

// Main function to create templates
function createTemplates() {
  console.log('🚀 Creating Excel Templates...\n');
  
  // Create empty template
  const emptyTemplate = createExcelTemplate();
  XLSX.writeFile(emptyTemplate, 'Investment_Template_Empty.xlsx');
  console.log('✅ Created: Investment_Template_Empty.xlsx (blank template)');
  
  // Create sample template
  const sampleTemplate = createSampleTemplate();
  XLSX.writeFile(sampleTemplate, 'Investment_Template_Sample.xlsx');
  console.log('✅ Created: Investment_Template_Sample.xlsx (with sample data)');
  
  // Create instructions template
  const instructionsWb = XLSX.utils.book_new();
  const instructionsWs = createInstructionsSheet();
  XLSX.utils.book_append_sheet(instructionsWb, instructionsWs, 'Instructions');
  XLSX.writeFile(instructionsWb, 'Investment_Template_Instructions.xlsx');
  console.log('✅ Created: Investment_Template_Instructions.xlsx (detailed instructions)');
  
  console.log('\n📋 Template Files Created:');
  console.log('1. Investment_Template_Empty.xlsx - Blank template for data entry');
  console.log('2. Investment_Template_Sample.xlsx - Template with example data');
  console.log('3. Investment_Template_Instructions.xlsx - Detailed instructions');
  
  console.log('\n🎯 Usage:');
  console.log('• Download Investment_Template_Empty.xlsx');
  console.log('• Fill out both Summary and Projections sheets');
  console.log('• Upload completed file to POST /api/templates/import');
  console.log('• System will validate and create investment records');
  
  return {
    emptyTemplate: 'Investment_Template_Empty.xlsx',
    sampleTemplate: 'Investment_Template_Sample.xlsx',
    instructionsTemplate: 'Investment_Template_Instructions.xlsx'
  };
}

// Run template creation
if (require.main === module) {
  createTemplates();
}

module.exports = {
  createExcelTemplate,
  createSampleTemplate,
  createInstructionsSheet,
  createTemplates
};