import * as XLSX from 'xlsx';

export interface SummaryData {
  companyName?: string;
  sector?: string;
  stage?: string;
  investmentType?: string;
  currency?: string;
  committedCapitalLocal?: number;
  ownershipPercent?: number;
  entryValuation?: number;
  isPostMoney?: boolean;
  snapshotDate?: Date;
  cashAtSnapshot?: number;
  monthlyBurn?: number;
  customersAtSnapshot?: number;
  expectedLiquidityYear?: number;
  expectedLiquidityValuation?: number;
  expectedLiquidityType?: string;
}

export interface ProjectionsData {
  revenue: Array<{ year: number; value: number }>;
  cogs: Array<{ year: number; value: number }>;
  opex: Array<{ year: number; value: number }>;
  ebitda: Array<{ year: number; value: number }>;
}

export interface ParsedExcelData {
  summary: SummaryData;
  projections: ProjectionsData;
}

export interface ValidationError {
  sheet: string;
  field: string;
  message: string;
}

export class ExcelTemplateProcessor {
  private workbook: XLSX.WorkBook | null = null;
  private errors: ValidationError[] = [];

  constructor(private buffer: Buffer) {}

  parse(): { success: boolean; data?: ParsedExcelData; errors?: ValidationError[] } {
    try {
      this.workbook = XLSX.read(this.buffer, { type: 'buffer', cellDates: true });

      // Validate structure
      if (!this.validateStructure()) {
        return { success: false, errors: this.errors };
      }

      // Parse both sheets
      const summary = this.parseSummarySheet();
      const projections = this.parseProjectionsSheet();

      if (this.errors.length > 0) {
        return { success: false, errors: this.errors };
      }

      return {
        success: true,
        data: { summary, projections }
      };
    } catch (error: any) {
      this.errors.push({
        sheet: 'General',
        field: 'File',
        message: `Failed to parse Excel file: ${error.message}`
      });
      return { success: false, errors: this.errors };
    }
  }

  private validateStructure(): boolean {
    if (!this.workbook) {
      this.errors.push({
        sheet: 'General',
        field: 'File',
        message: 'Workbook is null'
      });
      return false;
    }

    const sheetNames = this.workbook.SheetNames;

    if (!sheetNames.includes('Summary')) {
      this.errors.push({
        sheet: 'General',
        field: 'Sheets',
        message: 'Missing required sheet: Summary'
      });
    }

    if (!sheetNames.includes('Projections')) {
      this.errors.push({
        sheet: 'General',
        field: 'Sheets',
        message: 'Missing required sheet: Projections'
      });
    }

    return this.errors.length === 0;
  }

  private parseSummarySheet(): SummaryData {
    if (!this.workbook) return {};

    const sheet = this.workbook.Sheets['Summary'];
    if (!sheet) return {};

    // Convert sheet to JSON (2-column format: Field Name | Value)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];

    const summary: SummaryData = {};
    const fieldMap: Record<string, keyof SummaryData> = {
      'Company Name': 'companyName',
      'Sector': 'sector',
      'Stage': 'stage',
      'Investment Type': 'investmentType',
      'Currency': 'currency',
      'Committed Capital (Local)': 'committedCapitalLocal',
      'Ownership %': 'ownershipPercent',
      'Entry Valuation': 'entryValuation',
      'isPostMoney': 'isPostMoney',
      'Snapshot Date': 'snapshotDate',
      'Cash at Snapshot': 'cashAtSnapshot',
      'Monthly Burn': 'monthlyBurn',
      'Customers at Snapshot': 'customersAtSnapshot',
      'Expected Liquidity Year': 'expectedLiquidityYear',
      'Expected Liquidity Valuation': 'expectedLiquidityValuation',
      'Expected Liquidity Type': 'expectedLiquidityType'
    };

    for (const row of data) {
      if (row.length < 2) continue;

      const fieldName = String(row[0] || '').trim();
      const value = row[1];

      if (!fieldName || value === null || value === undefined || value === '') continue;

      const key = fieldMap[fieldName];
      if (!key) continue;

      // Type conversion
      if (key === 'isPostMoney') {
        summary[key] = Boolean(value);
      } else if (key === 'snapshotDate') {
        summary[key] = value instanceof Date ? value : new Date(value);
      } else if (['committedCapitalLocal', 'ownershipPercent', 'entryValuation', 'cashAtSnapshot', 'monthlyBurn', 'expectedLiquidityValuation'].includes(key)) {
        summary[key] = Number(value);
      } else if (['customersAtSnapshot', 'expectedLiquidityYear'].includes(key)) {
        summary[key] = Math.floor(Number(value));
      } else {
        (summary as any)[key] = String(value);
      }
    }

    // Validate runway calculation requirement
    if (summary.monthlyBurn !== undefined) {
      const year1Revenue = this.workbook.Sheets['Projections'] ? this.getProjectionValue('Projections', 'Revenue', 1) : undefined;
      const year1EBITDA = this.workbook.Sheets['Projections'] ? this.getProjectionValue('Projections', 'EBITDA', 1) : undefined;

      if ((year1Revenue === undefined || year1Revenue === 0) && (year1EBITDA !== undefined && year1EBITDA < 0)) {
        // Runway calculation is required
      } else if (year1Revenue !== undefined && year1Revenue === 0 && year1EBITDA !== undefined && year1EBITDA < 0) {
        // OK
      }
    }

    return summary;
  }

  private parseProjectionsSheet(): ProjectionsData {
    if (!this.workbook) {
      return {
        revenue: [],
        cogs: [],
        opex: [],
        ebitda: []
      };
    }

    const sheet = this.workbook.Sheets['Projections'];
    if (!sheet) {
      return {
        revenue: [],
        cogs: [],
        opex: [],
        ebitda: []
      };
    }

    // Convert sheet to JSON (tabular format: Metric | Y1 | Y2 | Y3 | Y4 | Y5)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    const projections: ProjectionsData = {
      revenue: [],
      cogs: [],
      opex: [],
      ebitda: []
    };

    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0] === 'Metric' || (row[0] && String(row[0]).toLowerCase().includes('metric'))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      this.errors.push({
        sheet: 'Projections',
        field: 'Header',
        message: 'Could not find header row with "Metric" column'
      });
      return projections;
    }

    // Parse data rows
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 2) continue;

      const metric = String(row[0] || '').trim().toUpperCase();
      if (!metric) continue;

      // Extract Y1-Y5 values (exactly 5 years)
      const values = [];
      for (let year = 1; year <= 5; year++) {
        const value = row[year];
        values.push({
          year,
          value: value !== null && value !== undefined ? Number(value) : 0
        });
      }

      // Map to correct metric
      if (metric === 'REVENUE') {
        projections.revenue = values;
      } else if (metric === 'COGS') {
        projections.cogs = values;
      } else if (metric === 'OPEX') {
        projections.opex = values;
      } else if (metric === 'EBITDA') {
        projections.ebitda = values;
      }
    }

    // Validate that we have exactly 5 years for each metric
    const validateYears = (metricName: string, values: Array<{ year: number; value: number }>) => {
      if (values.length !== 5) {
        this.errors.push({
          sheet: 'Projections',
          field: metricName,
          message: `Expected exactly 5 years of data, got ${values.length}`
        });
      }
    };

    validateYears('Revenue', projections.revenue);
    validateYears('COGS', projections.cogs);
    validateYears('Opex', projections.opex);
    validateYears('EBITDA', projections.ebitda);

    return projections;
  }

  private getProjectionValue(sheetName: string, metric: string, year: number): number | undefined {
    if (!this.workbook) return undefined;

    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) return undefined;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    for (const row of data) {
      if (row[0] && String(row[0]).trim().toUpperCase() === metric.toUpperCase()) {
        return row[year] !== null && row[year] !== undefined ? Number(row[year]) : undefined;
      }
    }

    return undefined;
  }
}
