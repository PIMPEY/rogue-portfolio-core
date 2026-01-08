import { Router, Request, Response } from 'express';
import { PrismaClient, InvestmentType, InvestmentStatus, InvestmentStage } from '@prisma/client';
import multer from 'multer';
import { investmentDataAgent, InvestmentData } from '../services/aiAgent';
import { parseFile } from '../utils/fileParser';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|xlsx?|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Excel (xlsx/xls), and CSV files are allowed'));
    }
  },
});

/**
 * POST /api/ai/ingest
 * Parse and ingest investment data using AI
 *
 * Body:
 * - text: string (unstructured text containing investment data)
 * - autoImport: boolean (if true, automatically import to database)
 */
router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const { text, autoImport = false } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "text" field in request body',
      });
    }

    // Use AI agent to parse the data
    console.log('Parsing investment data with AI agent...');
    const parsed = await investmentDataAgent.parseInvestmentData(text);

    if (parsed.investments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No investment data could be extracted from the provided text',
        warnings: parsed.warnings,
      });
    }

    // If autoImport is true, save to database
    if (autoImport) {
      const imported = [];
      const errors = [];

      for (const inv of parsed.investments) {
        try {
          const investment = await createInvestment(inv);
          imported.push(investment);
        } catch (error: any) {
          errors.push({
            companyName: inv.companyName,
            error: error.message,
          });
        }
      }

      return res.json({
        success: true,
        message: `Successfully imported ${imported.length} out of ${parsed.investments.length} investments`,
        data: {
          parsed: parsed.investments,
          imported,
          errors,
          warnings: parsed.warnings,
          confidence: parsed.confidence,
        },
      });
    }

    // Return parsed data without importing
    return res.json({
      success: true,
      message: `Successfully parsed ${parsed.investments.length} investment(s). Use autoImport=true to save to database.`,
      data: {
        parsed: parsed.investments,
        warnings: parsed.warnings,
        confidence: parsed.confidence,
      },
    });
  } catch (error: any) {
    console.error('AI ingestion error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process investment data',
    });
  }
});

/**
 * POST /api/ai/ingest/upload
 * Parse and ingest investment data from uploaded files (PDF, Excel, CSV)
 *
 * Form data:
 * - file: File (PDF, Excel, or CSV)
 * - autoImport: boolean (if true, automatically import to database)
 */
router.post('/ingest/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a PDF, Excel, or CSV file.',
      });
    }

    const autoImport = req.body.autoImport === 'true' || req.body.autoImport === true;

    console.log(`📄 Processing uploaded file: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

    // Parse file to text
    let extractedText: string;
    try {
      extractedText = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
      console.log(`✅ Successfully extracted text from file (${extractedText.length} characters)`);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: `Failed to parse file: ${error.message}`,
      });
    }

    // Use AI agent to parse the extracted text
    console.log('🤖 Parsing extracted text with AI agent...');
    const parsed = await investmentDataAgent.parseInvestmentData(extractedText);

    if (parsed.investments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No investment data could be extracted from the uploaded file',
        warnings: parsed.warnings,
        extractedText: extractedText.substring(0, 500), // Show first 500 chars for debugging
      });
    }

    // If autoImport is true, save to database
    if (autoImport) {
      const imported = [];
      const errors = [];

      for (const inv of parsed.investments) {
        try {
          const investment = await createInvestment(inv);
          imported.push(investment);
        } catch (error: any) {
          errors.push({
            companyName: inv.companyName,
            error: error.message,
          });
        }
      }

      return res.json({
        success: true,
        message: `Successfully imported ${imported.length} out of ${parsed.investments.length} investments from ${req.file.originalname}`,
        data: {
          parsed: parsed.investments,
          imported,
          errors,
          warnings: parsed.warnings,
          confidence: parsed.confidence,
          fileName: req.file.originalname,
        },
      });
    }

    // Return parsed data without importing
    return res.json({
      success: true,
      message: `Successfully parsed ${parsed.investments.length} investment(s) from ${req.file.originalname}. Use autoImport=true to save to database.`,
      data: {
        parsed: parsed.investments,
        warnings: parsed.warnings,
        confidence: parsed.confidence,
        fileName: req.file.originalname,
      },
    });
  } catch (error: any) {
    console.error('File upload ingestion error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process uploaded file',
    });
  }
});

/**
 * POST /api/ai/analyze
 * Analyze portfolio and provide AI-powered insights
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    // Fetch all investments
    const investments = await prisma.investment.findMany({
      select: {
        companyName: true,
        sector: true,
        stage: true,
        geography: true,
        committedCapitalLcl: true,
        deployedCapitalLcl: true,
        currentFairValueEur: true,
        status: true,
        calculatedRunwayMonths: true,
      },
    });

    if (investments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No investments found in portfolio',
      });
    }

    // Get AI analysis
    const analysis = await investmentDataAgent.analyzePortfolio(investments);

    return res.json({
      success: true,
      data: {
        analysis,
        portfolioSize: investments.length,
      },
    });
  } catch (error: any) {
    console.error('Portfolio analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze portfolio',
    });
  }
});

/**
 * Helper function to create investment in database
 */
async function createInvestment(data: InvestmentData) {
  // Generate IC reference
  const year = data.investmentDate ? new Date(data.investmentDate).getFullYear() : new Date().getFullYear();
  const existingCount = await prisma.investment.count({
    where: {
      icReference: {
        startsWith: `IC-${year}-`,
      },
    },
  });
  const icReference = `IC-${year}-${String(existingCount + 1).padStart(3, '0')}`;

  // Parse investment date
  const investmentDate = data.investmentDate ? new Date(data.investmentDate) : new Date();
  const icApprovalDate = new Date(investmentDate);
  icApprovalDate.setDate(icApprovalDate.getDate() - 14); // 2 weeks before

  // Calculate runway if monthly burn provided
  const calculatedRunway = data.monthlyBurn && data.initialCash
    ? Math.round(data.initialCash / data.monthlyBurn)
    : null;

  // Calculate fair value (assume at cost initially)
  const currentFairValue = data.deployedCapital || data.committedCapital || 0;

  // Create investment
  const investment = await prisma.investment.create({
    data: {
      icReference,
      icApprovalDate,
      investmentExecutionDate: investmentDate,
      companyName: data.companyName,
      sector: data.sector || 'Other',
      stage: (data.stage as InvestmentStage) || 'SERIES_A',
      geography: data.geography || 'Unknown',
      investmentType: (data.investmentType as InvestmentType) || 'EQUITY',
      committedCapitalLcl: data.committedCapital || 0,
      deployedCapitalLcl: data.deployedCapital || data.committedCapital || 0,
      committedCapitalEur: data.committedCapital || 0,
      deployedCapitalEur: data.deployedCapital || data.committedCapital || 0,
      ownershipPercent: data.ownershipPercent || null,
      roundSizeEur: data.roundSize || null,
      enterpriseValueEur: data.enterpriseValue || null,
      currentFairValueEur: currentFairValue,
      snapshotDate: investmentDate,
      cashAtSnapshot: data.initialCash || null,
      monthlyBurn: data.monthlyBurn || null,
      calculatedRunwayMonths: calculatedRunway,
      status: 'ACTIVE' as InvestmentStatus,
      hasProRataRights: true,
      founders: data.founderNames && data.founderNames.length > 0 ? {
        create: data.founderNames.map((name, idx) => ({
          name,
          email: data.founderEmails?.[idx] || null,
        })),
      } : undefined,
      notes: data.notes ? {
        create: {
          authorUserId: 'ai-agent',
          body: data.notes,
          createdAt: new Date(),
        }
      } : undefined,
    },
  });

  return investment;
}

export default router;
