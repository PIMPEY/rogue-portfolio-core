const XLSX = require('xlsx');

class ExcelTemplateProcessor {
  constructor() {
    // Tier 1: MUST HAVE - Core investment identity (blocks import)
    this.tier1Required = [
      'companyName',
      'sector',
      'stage',
      'investmentType',
      'committedCapitalLcl',
      'currentFairValueEur'
    ];

    // Tier 2: SHOULD HAVE - Financial projections (warns but allows)
    this.tier2Projections = [
      'revenueY1', 'revenueY2', 'revenueY3', 'revenueY4', 'revenueY5',
      'cogsY1', 'cogsY2', 'cogsY3', 'cogsY4', 'cogsY5',
      'opexY1', 'opexY2', 'opexY3', 'opexY4', 'opexY5',
      'ebitdaY1', 'ebitdaY2', 'ebitdaY3', 'ebitdaY4', 'ebitdaY5'
    ];

    // Tier 3: NICE TO HAVE - Optional enrichment (auto-filled if missing)
    this.tier3Defaults = {
      'currency': 'EUR',
      'geography': 'Unknown',
      'ownershipPercent': null,
      'roundSizeEur': null,
      'enterpriseValueEur': null,
      'snapshotDate': null,
      'cashAtSnapshot': null,
      'customersAtSnapshot': null,
      'liquidityExpectation': null,
      'monthlyBurn': null
    };
  }

  async processExcelBuffer(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Validate we have exactly 2 sheets
      const sheetNames = workbook.SheetNames;
      if (sheetNames.length !== 2) {
        return {
          success: false,
          errors: [`Expected exactly 2 sheets, found ${sheetNames.length}. Expected: Summary, Projections`],
          preview: null
        };
      }

      // Validate sheet names
      const expectedSheets = ['Summary', 'Projections'];
      const actualSheets = sheetNames.map(name => name.trim());
      const missingSheets = expectedSheets.filter(expected => 
        !actualSheets.some(actual => actual.toLowerCase() === expected.toLowerCase())
      );

      if (missingSheets.length > 0) {
        return {
          success: false,
          errors: [`Missing required sheets: ${missingSheets.join(', ')}`],
          preview: null
        };
      }

      // Parse Summary sheet
      const summarySheet = workbook.Sheets['Summary'] || workbook.Sheets[0];
      const summaryData = this.parseSummarySheet(summarySheet);

      // Parse Projections sheet  
      const projectionsSheet = workbook.Sheets['Projections'] || workbook.Sheets[1];
      const projectionsData = this.parseProjectionsSheet(projectionsSheet);

      // Combine data
      const combinedData = {
        ...summaryData,
        ...projectionsData
      };

      // Apply Tier 3 defaults for missing optional fields
      const dataWithDefaults = this.applyDefaults(combinedData);

      // Validate the combined data with three-tier system
      const validation = this.validateData(dataWithDefaults);

      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
          preview: this.createPreview(dataWithDefaults)
        };
      }

      // Calculate runway if needed
      const runwayCalculation = this.calculateRunway(dataWithDefaults);

      return {
        success: true,
        data: {
          ...dataWithDefaults,
          ...runwayCalculation
        },
        warnings: validation.warnings,
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse Excel file: ${error.message}`],
        preview: null
      };
    }
  }

  parseSummarySheet(sheet) {
    const data = {};
    
    // Define field mappings for Summary sheet
    const fieldMappings = {
      'Company Name': 'companyName',
      'Sector': 'sector',
      'Stage': 'stage',
      'Geography': 'geography',
      'Investment Type': 'investmentType',
      'Committed Capital (Local)': 'committedCapitalLcl',
      'Ownership %': 'ownershipPercent',
      'Round Size (EUR)': 'roundSizeEur',
      'Enterprise Value (EUR)': 'enterpriseValueEur',
            'Current Fair Value (EUR)': 'currentFairValueEur',
      'Currency': 'currency',
      'Entry Valuation': 'entryValuation',
      'isPostMoney': 'isPostMoney',
      'Expected Liquidity Year': 'expectedLiquidityYear',
      
      'Snapshot Date': 'snapshotDate',
      'Cash at Snapshot': 'cashAtSnapshot',
      'Customers at Snapshot': 'customersAtSnapshot',

      'Liquidity Expectation': 'liquidityExpectation',
      'Expected Liquidity Date': 'expectedLiquidityDate',
      'Expected Liquidity Multiple': 'expectedLiquidityMultiple',
      'Monthly Burn': 'monthlyBurn'
    };

    // Parse the sheet
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
      const fieldCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const valueCell = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })];

      if (fieldCell && valueCell) {
        const fieldName = fieldCell.v;
        const mappedField = fieldMappings[fieldName];
        
        if (mappedField) {
          data[mappedField] = this.parseValue(valueCell.v, mappedField);
        }
      }
    }

    return data;
  }

  parseProjectionsSheet(sheet) {
    const data = {};
    
    // Define field mappings for Projections sheet
    const fieldMappings = {
      'Revenue Y1': 'revenueY1',
      'Revenue Y2': 'revenueY2', 
      'Revenue Y3': 'revenueY3',
      'Revenue Y4': 'revenueY4',
      'Revenue Y5': 'revenueY5',
      
            'COGS Y1': 'cogsY1',
      'COGS Y2': 'cogsY2',
      'COGS Y3': 'cogsY3',
      'COGS Y4': 'cogsY4',
      'COGS Y5': 'cogsY5',
      
      'OPEX Y1': 'opexY1',
      'OPEX Y2': 'opexY2',
      'OPEX Y3': 'opexY3',
      'OPEX Y4': 'opexY4',
      'OPEX Y5': 'opexY5',
      'EBITDA Y1': 'ebitdaY1',
      'EBITDA Y2': 'ebitdaY2',
      'EBITDA Y3': 'ebitdaY3',
      'EBITDA Y4': 'ebitdaY4',
      'EBITDA Y5': 'ebitdaY5'
    };

    // Parse the sheet
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
      const fieldCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const valueCell = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })];

      if (fieldCell && valueCell) {
        const fieldName = fieldCell.v;
        const mappedField = fieldMappings[fieldName];
        
        if (mappedField) {
          data[mappedField] = this.parseValue(valueCell.v, mappedField);
        }
      }
    }

    return data;
  }

  parseValue(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Handle date fields
    if (fieldName.includes('Date')) {
      if (value instanceof Date) {
        return value;
      }
      // Try to parse as date
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    // Handle numeric fields
    if (typeof value === 'number') {
      return value;
    }

    // Handle string values that should be numbers
    if (typeof value === 'string') {
      const numericValue = parseFloat(value.replace(/,/g, ''));
      return isNaN(numericValue) ? value : numericValue;
    }

    return value;
  }

  applyDefaults(data) {
    // Apply Tier 3 defaults for any missing optional fields
    const result = { ...data };

    for (const [field, defaultValue] of Object.entries(this.tier3Defaults)) {
      if (result[field] === null || result[field] === undefined || result[field] === '') {
        result[field] = defaultValue;
      }
    }

    return result;
  }

  validateData(data) {
    const errors = [];
    const warnings = [];

    // TIER 1: Check core required fields (blocks import)
    for (const field of this.tier1Required) {
      if (data[field] === null || data[field] === undefined || data[field] === "") {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // TIER 2: Check projection fields (warns but allows)
    const missingProjections = this.tier2Projections.filter(field =>
      data[field] === null || data[field] === undefined || data[field] === ""
    );

    if (missingProjections.length > 0) {
      warnings.push(`Missing ${missingProjections.length} projection fields - forecast charts will be incomplete`);
    }

    // Additional validation only if Tier 1 passed
    if (errors.length === 0) {
      // Validate stage enum
      const validStages = ['PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'SERIES_D_PLUS', 'GROWTH', 'OTHER'];
      if (data.stage && !validStages.includes(data.stage.toUpperCase().replace(/[-\s]/g, '_'))) {
        warnings.push(`Stage "${data.stage}" may not match expected values. Valid: ${validStages.join(', ')}`);
      }

      // Validate investment type enum
      const validTypes = ['SAFE', 'CLN', 'EQUITY', 'OTHER'];
      if (data.investmentType && !validTypes.includes(data.investmentType.toUpperCase())) {
        warnings.push(`Investment type "${data.investmentType}" may not match expected values. Valid: ${validTypes.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  calculateRunway(data) {
    const result = {};

    // Check if runway calculation is needed
    const y1Revenue = data.revenueY1 || 0;
    const y1Ebitda = data.ebitdaY1 || 0;
    
    const runwayRequired = (y1Revenue === 0 || y1Revenue === null || y1Revenue === undefined) || 
                          (y1Ebitda < 0);

    if (runwayRequired && data.monthlyBurn && data.monthlyBurn > 0 && data.snapshotDate) {
      // Calculate months between snapshotDate and today
      const snapshotDate = new Date(data.snapshotDate);
      const today = new Date();
      
      // Calculate difference in months
      const monthsDiff = (today.getFullYear() - snapshotDate.getFullYear()) * 12 + 
                        (today.getMonth() - snapshotDate.getMonth());
      
      // Calculate runway: (cash at snapshot) / monthly burn
      const cashAtSnapshot = data.cashAtSnapshot || 0;
      const monthlyBurn = data.monthlyBurn;
      
      const calculatedRunwayMonths = cashAtSnapshot > 0 && monthlyBurn > 0 ? 
        cashAtSnapshot / monthlyBurn : 0;

      result.calculatedRunwayMonths = calculatedRunwayMonths;
    }

    return result;
  }

  createPreview(data) {
    return {
      companyName: data.companyName || 'N/A',
      sector: data.sector || 'N/A',
      stage: data.stage || 'N/A',
      y1Revenue: data.revenueY1 || 0,
      y1Ebitda: data.ebitdaY1 || 0,
      cashAtSnapshot: data.cashAtSnapshot || 0,
      monthlyBurn: data.monthlyBurn || 0,
      snapshotDate: data.snapshotDate ? data.snapshotDate.toISOString().split('T')[0] : 'N/A'
    };
  
}

}

module.exports = ExcelTemplateProcessor;