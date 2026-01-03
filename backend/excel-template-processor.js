const XLSX = require('xlsx');

class ExcelTemplateProcessor {
  constructor() {
    this.requiredSummaryFields = [
      'companyName',
      'sector', 
      'stage',
      'investmentType',
      'committedCapitalLcl',
      'ownershipPercent',
      'roundSizeEur',
      'enterpriseValueEur',
      'currentFairValueEur',
      'snapshotDate',
      'cashAtSnapshot',
      'customersAtSnapshot',
      'arrAtSnapshot',
      'liquidityExpectation'
    ];

    this.requiredProjectionFields = [
      'revenueY1', 'revenueY2', 'revenueY3', 'revenueY4', 'revenueY5',
      'arrY1', 'arrY2', 'arrY3', 'arrY4', 'arrY5',
      'cogsY1', 'cogsY2', 'cogsY3', 'cogsY4', 'cogsY5',
      'opexY1', 'opexY2', 'opexY3', 'opexY4', 'opexY5',
      'ebitdaY1', 'ebitdaY2', 'ebitdaY3', 'ebitdaY4', 'ebitdaY5'
    ];
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

      // Validate the combined data
      const validation = this.validateData(combinedData);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          preview: this.createPreview(combinedData)
        };
      }

      // Calculate runway if needed
      const runwayCalculation = this.calculateRunway(combinedData);
      
      return {
        success: true,
        data: {
          ...combinedData,
          ...runwayCalculation
        },
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

  validateData(data) {
    const errors = [];
    
    // Check required Summary fields
    for (const field of this.requiredSummaryFields) {
      if (data[field] === null || data[field] === undefined || data[field] === "") {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Validate currency field
    if (!data.currency || data.currency === "") {
      errors.push("Currency is required");
    }
    
    // Validate entry valuation
    if (!data.entryValuation || data.entryValuation <= 0) {
      errors.push("Entry valuation must be greater than 0");
    }
    
    // Validate isPostMoney boolean
    if (data.isPostMoney === undefined || data.isPostMoney === null) {
      errors.push("isPostMoney field is required (true/false)");
    }
    
    // Validate liquidity year (1-5 relative)
    if (data.expectedLiquidityYear) {
      const liquidityYear = parseInt(data.expectedLiquidityYear);
      if (isNaN(liquidityYear) || liquidityYear < 1 || liquidityYear > 5) {
        errors.push("Expected Liquidity Year must be between 1 and 5 (relative years)");
      }
    }
    
    // Check if runway calculation is required
    const y1Revenue = data.revenueY1 || 0;
    const y1Ebitda = data.ebitdaY1 || 0;
    
    const runwayRequired = (y1Revenue === 0 || y1Revenue === null || y1Revenue === undefined) || 
                          (y1Ebitda < 0);
    
    if (runwayRequired) {
      if (!data.monthlyBurn || data.monthlyBurn <= 0) {
        errors.push("Monthly burn is required when Y1 revenue is 0/blank or Y1 EBITDA is negative");
      }
      if (!data.snapshotDate) {
        errors.push("Snapshot date is required for runway calculation");
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
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