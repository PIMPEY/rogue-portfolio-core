import * as XLSX from 'xlsx';

/**
 * Parse Excel file to text
 */
export async function parseExcelFile(buffer: Buffer): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let allText = '';

    // Process each sheet
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to CSV format for better AI parsing
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      allText += `\n\n=== Sheet: ${sheetName} ===\n${csv}`;
    });

    return allText;
  } catch (error: any) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Parse PDF file to text
 */
export async function parsePdfFile(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse to handle CommonJS module
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default as any;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error: any) {
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
}

/**
 * Parse CSV file to text
 */
export function parseCsvFile(buffer: Buffer): string {
  try {
    const text = buffer.toString('utf-8');
    return text;
  } catch (error: any) {
    throw new Error(`Failed to parse CSV file: ${error.message}`);
  }
}

/**
 * Parse file based on file type
 */
export async function parseFile(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  // Determine file type from MIME type or extension
  const extension = filename.toLowerCase().split('.').pop();

  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    extension === 'xlsx' ||
    extension === 'xls'
  ) {
    return await parseExcelFile(buffer);
  }

  if (mimeType.includes('pdf') || extension === 'pdf') {
    return await parsePdfFile(buffer);
  }

  if (mimeType.includes('csv') || extension === 'csv') {
    return parseCsvFile(buffer);
  }

  throw new Error(
    `Unsupported file type: ${mimeType}. Supported types: PDF, Excel (xlsx/xls), CSV`
  );
}
