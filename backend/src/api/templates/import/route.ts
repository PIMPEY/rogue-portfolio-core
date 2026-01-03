import { Request, Response } from 'express';
import { ExcelTemplateProcessor } from '../../../lib/excel-template-processor';
import { prisma } from '../../../lib/prisma';

export async function handler(req: Request, res: Response) {
  const { investmentId } = req.body;
  const file = (req as any).file;

  // Validate request
  if (!investmentId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: investmentId'
    });
  }

  if (!file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  // Validate file type
  if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)'
    });
  }

  try {
    // Check if investment exists
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    // Parse Excel file
    const processor = new ExcelTemplateProcessor(file.buffer);
    const result = processor.parse();

    if (!result.success || !result.data) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse Excel file',
        validationErrors: result.errors,
        preview: null
      });
    }

    const { summary, projections } = result.data;

    // Create preview data
    const preview = {
      summary,
      projections,
      warnings: result.errors?.filter(e => e.message.includes('warning')) || []
    };

    // If there are validation errors, return preview without saving
    if (result.errors && result.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors: result.errors,
        preview
      });
    }

    // Save data to database
    await prisma.$transaction(async (tx) => {
      // 1. Update or create InvestmentThesis
      if (summary.currency || summary.entryValuation || summary.snapshotDate) {
        await tx.investmentThesis.upsert({
          where: { investmentId },
          create: {
            investmentId,
            currency: summary.currency || 'USD',
            entryValuation: summary.entryValuation,
            isPostMoney: summary.isPostMoney || false,
            snapshotDate: summary.snapshotDate,
            snapshotCash: summary.cashAtSnapshot,
            snapshotBurn: summary.monthlyBurn,
            snapshotCustomers: summary.customersAtSnapshot
          },
          update: {
            currency: summary.currency || 'USD',
            entryValuation: summary.entryValuation,
            isPostMoney: summary.isPostMoney || false,
            snapshotDate: summary.snapshotDate,
            snapshotCash: summary.cashAtSnapshot,
            snapshotBurn: summary.monthlyBurn,
            snapshotCustomers: summary.customersAtSnapshot
          }
        });
      }

      // 2. Update or create InvestmentLiquidity
      if (summary.expectedLiquidityYear) {
        await tx.investmentLiquidity.upsert({
          where: {
            investmentId_expectedYear: {
              investmentId,
              expectedYear: summary.expectedLiquidityYear
            }
          },
          create: {
            investmentId,
            expectedYear: summary.expectedLiquidityYear,
            expectedValuation: summary.expectedLiquidityValuation,
            expectedType: summary.expectedLiquidityType
          },
          update: {
            expectedValuation: summary.expectedLiquidityValuation,
            expectedType: summary.expectedLiquidityType
          }
        });
      }

      // 3. Create or update Forecast (use normalized storage)
      // First, find or create a forecast version
      const latestForecast = await tx.forecast.findFirst({
        where: { investmentId },
        orderBy: { version: 'desc' }
      });

      const newVersion = latestForecast ? latestForecast.version + 1 : 1;

      const forecast = await tx.forecast.create({
        data: {
          investmentId,
          version: newVersion,
          startQuarter: new Date(), // Current date
          horizonQuarters: 20, // 5 years = 20 quarters
          rationale: 'Imported from Excel template'
        }
      });

      // Convert annual projections to quarterly (divide by 4 for simplicity)
      const createQuarterlyMetrics = (
        metricType: 'REVENUE' | 'COGS' | 'OPEX' | 'EBITDA',
        yearlyData: Array<{ year: number; value: number }>
      ) => {
        const metrics = [];
        for (const { year, value } of yearlyData) {
          const quarterlyValue = value / 4;
          for (let q = 1; q <= 4; q++) {
            const quarterIndex = (year - 1) * 4 + q;
            metrics.push({
              forecastId: forecast.id,
              metric: metricType,
              quarterIndex,
              value: quarterlyValue
            });
          }
        }
        return metrics;
      };

      // Create ForecastMetrics for all projection types
      if (projections.revenue.length > 0) {
        const revenueMetrics = createQuarterlyMetrics('REVENUE', projections.revenue);
        await tx.forecastMetric.createMany({ data: revenueMetrics });
      }

      if (projections.cogs.length > 0) {
        const cogsMetrics = createQuarterlyMetrics('COGS', projections.cogs);
        await tx.forecastMetric.createMany({ data: cogsMetrics });
      }

      if (projections.opex.length > 0) {
        const opexMetrics = createQuarterlyMetrics('OPEX', projections.opex);
        await tx.forecastMetric.createMany({ data: opexMetrics });
      }

      if (projections.ebitda.length > 0) {
        const ebitdaMetrics = createQuarterlyMetrics('EBITDA', projections.ebitda);
        await tx.forecastMetric.createMany({ data: ebitdaMetrics });
      }
    });

    res.json({
      success: true,
      message: 'Excel template imported successfully',
      preview
    });
  } catch (error: any) {
    console.error('Error importing Excel template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import template',
      details: error.message
    });
  }
}
