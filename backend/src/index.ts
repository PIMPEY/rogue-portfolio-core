import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler';
import { authenticate, AuthRequest } from './middleware/auth';
import { requireChangeRationale, ChangeRationaleRequest } from './middleware/changeRationale';
import multer from 'multer';







import ExcelTemplateProcessor from "../excel-template-processor.js";


console.log('🚀 Starting backend server...');
console.log('📝 Environment:', process.env.NODE_ENV || 'development');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🔧 Port configured:', PORT);
console.log('🗄️  Database URL configured:', process.env.DATABASE_URL ? '✅ Yes' : '❌ No');

app.use(cors());
app.use(express.json());

// Configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Simple health check that works even before database connection
app.get('/health', (req, res) => {
  console.log('💓 Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Backend is running'
  });
});

// Clear database endpoint (for testing only)
app.post('/api/clear-db', asyncHandler(async (req, res) => {
  console.log('🗑️  Clear database endpoint called');
  
  try {
    // Delete in correct order due to foreign keys
    await prisma.forecastMetric.deleteMany();
    await prisma.forecast.deleteMany();
    await prisma.flag.deleteMany();
    await prisma.founderUpdate.deleteMany();
    await prisma.cashflow.deleteMany();
    await prisma.founder.deleteMany();
    await prisma.investment.deleteMany();
    
    console.log('✅ Database cleared');
    res.json({ success: true, message: 'Database cleared successfully' });
  } catch (error: any) {
    console.error('Clear database error:', error);
    res.status(500).json({ success: false, message: `Failed to clear database: ${error.message}` });
  }
}));

// Seed endpoint for adding demo data
app.post('/api/seed', asyncHandler(async (req, res) => {
  console.log('🌱 Seed endpoint called');
  
  // Run seed using tsx (to avoid TypeScript compilation issues)
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    const { stdout, stderr } = await execPromise('npm run seed:prod', { cwd: __dirname + '/..' });
    console.log('Seed output:', stdout);
    if (stderr) console.error('Seed stderr:', stderr);
    
    const newCount = await prisma.investment.count();
    res.json({ 
      success: true, 
      message: `Successfully seeded database`,
      count: newCount 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Seed failed: ${error.message}` 
    });
  }
}));

// app.post("/api/documents/presigned-url", asyncHandler(presignedUrlHandler)); // Disabled for MVP
// app.post("/api/documents/upload-complete", asyncHandler(uploadCompleteHandler)); // Disabled for MVP
// app.post("/api/review/start", asyncHandler(startReviewHandler)); // Disabled for MVP
// app.get("/api/review/:id", asyncHandler(reviewJobHandler)); // Disabled for MVP
// app.post("/api/review/:id", asyncHandler(reviewJobHandler)); // Disabled for MVP
// app.post("/api/review/analyze", asyncHandler(analyzeHandler)); // Disabled for MVP
// app.post("/api/review/analyze-direct", asyncHandler(analyzeDirectHandler)); // Disabled for MVP

app.get('/api/portfolio', asyncHandler(async (req, res) => {
  const investments = await prisma.investment.findMany({
    include: {
      founders: true,
      cashflows: true,
      valuations: true,
      flags: true,
      founderUpdates: true,
    },
  });

  // Transform data to match frontend expectations
  const transformed = investments.map(inv => {
    // Calculate gross MOIC
    const grossMoic = inv.committedCapitalLcl > 0
      ? (inv.currentFairValueEur / inv.committedCapitalLcl).toFixed(2)
      : '0.00';

    // Calculate gross IRR (simplified)
    const grossIrr = '0.00'; // Would need proper XIRR calculation

    // Map status to GREEN/AMBER/RED based on flags
    const activeFlags = inv.flags.filter(f => f.status !== 'RESOLVED').length;
    let status = 'GREEN';
    if (activeFlags >= 3) status = 'RED';
    else if (activeFlags >= 1) status = 'AMBER';

    // Count founder updates
    const totalUpdates = inv.founderUpdates.length;
    const latestUpdateQuarter = totalUpdates > 0
      ? Math.max(...inv.founderUpdates.map(u => u.quarterIndex))
      : 0;

    return {
      id: inv.id,
      companyName: inv.companyName,
      sector: inv.sector,
      stage: inv.stage,
      // geography: inv.geography, // Field removed
      investmentType: inv.investmentType,
      committedCapitalEur: inv.committedCapitalLcl,
      deployedCapitalEur: inv.deployedCapitalLcl,
      ownershipPercent: inv.ownershipPercent,
      investmentDate: inv.investmentExecutionDate.toISOString().split('T')[0],
      currentFairValueEur: inv.currentFairValueEur,
      grossMoic: grossMoic,
      grossIrr: grossIrr,
      roundSizeEur: inv.roundSizeEur,
      enterpriseValueEur: inv.enterpriseValueEur,
      runway: null, // Would need calculation from founder updates
      status: status,
      activeFlags: activeFlags,
      founders: inv.founders.map(f => ({
        name: f.name,
        email: f.email
      })),
      raisedFollowOnCapital: inv.raisedFollowOnCapital,
      clearProductMarketFit: inv.clearProductMarketFit,
      meaningfulRevenue: inv.meaningfulRevenue,
      totalUpdates: totalUpdates,
      latestUpdateQuarter: latestUpdateQuarter,
      // Include raw data for companies page
      _raw: {
        founderUpdates: inv.founderUpdates,
        forecasts: [], // Would need to include forecasts
        flags: inv.flags
      }
    };
  });

  res.json(transformed);
}));

app.get('/api/investments', asyncHandler(async (req, res) => {
  const investments = await prisma.investment.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(investments);
}));

app.get('/api/investments/:id', asyncHandler(async (req, res) => {
  const investment = await prisma.investment.findUnique({
    where: { id: req.params.id },
    include: {
      founders: true,
      cashflows: true,
      valuations: true,
      flags: true,
      documents: true,
      notes: true,
      forecasts: {
        include: { metrics: true },
      },
      founderUpdates: true,
      actionsRequired: true,
      auditLogs: true,
    },
  });
  if (!investment) {
    const error = new Error('Investment not found') as any;
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Transform to match frontend expectations
  const grossMoic = investment.committedCapitalLcl > 0
    ? (investment.currentFairValueEur / investment.committedCapitalLcl).toFixed(2)
    : '0.00';

  const activeFlags = investment.flags.filter(f => f.status !== 'RESOLVED').length;
  let status = 'GREEN';
  if (activeFlags >= 3) status = 'RED';
  else if (activeFlags >= 1) status = 'AMBER';

  const transformed = {
    id: investment.id,
    companyName: investment.companyName,
    sector: investment.sector,
    stage: investment.stage,
    // geography: investment.geography, // Field removed
    investmentType: investment.investmentType,
    committedCapitalLcl: investment.committedCapitalLcl,
    deployedCapitalLcl: investment.deployedCapitalLcl,
    ownershipPercent: investment.ownershipPercent,
    investmentDate: investment.investmentExecutionDate.toISOString().split('T')[0],
    currentFairValueEur: investment.currentFairValueEur,
    grossMoic: grossMoic,
    grossIrr: '0.00',
    roundSizeEur: investment.roundSizeEur,
    enterpriseValueEur: investment.enterpriseValueEur,
    status: status,
    activeFlags: activeFlags,
    founders: investment.founders.map(f => ({
      name: f.name,
      email: f.email
    })),
    raisedFollowOnCapital: investment.raisedFollowOnCapital,
    clearProductMarketFit: investment.clearProductMarketFit,
    meaningfulRevenue: investment.meaningfulRevenue,
    founderUpdates: investment.founderUpdates.map(u => ({
      id: u.id,
      quarterIndex: u.quarterIndex,
      dueDate: u.dueDate.toISOString().split('T')[0],
      submittedAt: u.submittedAt.toISOString().split('T')[0],
      status: u.status,
      actualRevenue: u.actualRevenue,
      actualBurn: u.actualBurn,
      actualRunwayMonths: u.actualRunwayMonths,
      actualTraction: u.actualTraction,
      narrativeGood: u.narrativeGood,
      narrativeBad: u.narrativeBad,
      narrativeHelp: u.narrativeHelp
    })),
    forecasts: investment.forecasts.map(f => ({
      id: f.id,
      version: f.version,
      startQuarter: f.startQuarter.toISOString().split('T')[0],
      horizonQuarters: f.horizonQuarters,
      rationale: f.rationale,
      metrics: f.metrics.map(m => ({
        id: m.id,
        metric: m.metric,
        quarterIndex: m.quarterIndex,
        value: m.value
      }))
    })),
    flags: investment.flags.map(f => ({
      id: f.id,
      type: f.type,
      metric: f.metric,
      threshold: f.threshold,
      actualValue: f.actualValue,
      forecastValue: f.forecastValue,
      deltaPct: f.deltaPct,
      status: f.status,
      createdAt: f.createdAt.toISOString().split('T')[0]
    }))
  };

  res.json(transformed);
}));

app.post('/api/investments', authenticate, requireChangeRationale, asyncHandler(async (req: ChangeRationaleRequest & AuthRequest, res) => {
  const { rationale } = req;
  const changedBy = req.user?.name || 'Unknown';

  const investment = await prisma.investment.create({
    data: {
      ...req.body,
      icReference: req.body.icReference || `IC-${Date.now()}`,
    },
  });

  await prisma.auditLog.create({
    data: {
      investmentId: investment.id,
      action: 'INVESTMENT_CREATED',
      rationale,
      changedBy,
    },
  });

  res.status(201).json(investment);
}));

app.post('/api/investments/create', asyncHandler(async (req, res) => {
  const { investment, files } = req.body;

  const createdInvestment = await prisma.investment.create({
    data: {
      companyName: investment.companyName,
      icReference: investment.icReference || `IC-${Date.now()}`,
      icApprovalDate: investment.icApprovalDate || new Date(),
      investmentExecutionDate: investment.investmentExecutionDate || new Date(),
      
      // geography: investment.geography || "Unknown", // Field removed
      investmentType: investment.investmentType || "EQUITY",
      committedCapitalLcl: investment.committedCapitalLcl || 0,
      currentFairValueEur: investment.currentFairValueEur || investment.committedCapitalLcl || 0,
      sector: investment.sector || "OTHER",
      stage: investment.stage || "SEED",
    }
  });

  if (files && files.length > 0) {
    for (const file of files) {
      await prisma.document.create({
        data: {
          investmentId: createdInvestment.id,
          type: 'OTHER',
          versionType: 'INITIAL',
          filePath: file.filePath,
          storageUrl: file.storageUrl || file.filePath,
          fileName: file.fileName,
          fileSize: file.fileSize,
          contentType: file.contentType || 'application/octet-stream',
          checksum: file.checksum || '',
          uploadedBy: "Unknown", // Field removed
          isCurrent: true
        }
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      investmentId: createdInvestment.id,
      action: 'INVESTMENT_CREATED',
      rationale: 'Investment created with document upload',
      changedBy: "Unknown", // Field removed
    },
  });

  res.status(201).json(createdInvestment);
}));

app.put('/api/investments/:id', authenticate, requireChangeRationale, asyncHandler(async (req: ChangeRationaleRequest & AuthRequest, res) => {
  const { id } = req.params;
  const { rationale } = req;
  const changedBy = req.user?.name || 'Unknown';

  const existingInvestment = await prisma.investment.findUnique({
    where: { id },
  });

  if (!existingInvestment) {
    const error = new Error('Investment not found') as any;
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  const changes: Record<string, { old: any; new: any }> = {};
  for (const key in req.body) {
    if (existingInvestment[key as keyof typeof existingInvestment] !== req.body[key]) {
      changes[key] = {
        old: existingInvestment[key as keyof typeof existingInvestment],
        new: req.body[key],
      };
    }
  }

  const investment = await prisma.investment.update({
    where: { id },
    data: req.body,
  });

  if (Object.keys(changes).length > 0) {
    // Audit logging removed for MVP
  }

  res.json(investment);
}));

app.get('/api/actions', asyncHandler(async (req, res) => {
  const actions = await prisma.actionRequired.findMany({
    include: { investment: true },
    orderBy: { reviewDate: 'asc' },
  });
  res.json(actions);
}));

app.get('/api/actions/:id', asyncHandler(async (req, res) => {
  const action = await prisma.actionRequired.findUnique({
    where: { id: req.params.id },
    include: { investment: true },
  });
  if (!action) {
    const error = new Error('Action not found') as any;
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }
  res.json(action);
}));

app.post('/api/valuations', authenticate, requireChangeRationale, asyncHandler(async (req: ChangeRationaleRequest & AuthRequest, res) => {
  const { investmentId, fairValueEur, valuationDate, changedBy: requestChangedBy } = req.body;
  const { rationale } = req;
  const changedBy = requestChangedBy || req.user?.name || 'Unknown';

  const existingInvestment = await prisma.investment.findUnique({
    where: { id: investmentId },
  });

  if (!existingInvestment) {
    const error = new Error('Investment not found') as any;
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Audit logging removed for MVP

  const valuation = await prisma.valuation.create({
    data: {
      investmentId,
      fairValueEur,
      valuationDate: new Date(valuationDate),
      rationale,
      changedBy,
    },
  });

  await prisma.investment.update({
    where: { id: investmentId },
    data: { currentFairValueEur: fairValueEur },
  });

  res.status(201).json(valuation);
}));

app.put('/api/actions/:id', authenticate, requireChangeRationale, asyncHandler(async (req: ChangeRationaleRequest & AuthRequest, res) => {
  const { id } = req.params;
  const { rationale } = req;
  const changedBy = req.user?.name || 'Unknown';

  const existingAction = await prisma.actionRequired.findUnique({
    where: { id },
  });

  if (!existingAction) {
    const error = new Error('Action not found') as any;
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  const changes: Record<string, { old: any; new: any }> = {};
  for (const key in req.body) {
    if (existingAction[key as keyof typeof existingAction] !== req.body[key]) {
      changes[key] = {
        old: existingAction[key as keyof typeof existingAction],
        new: req.body[key],
      };
    }
  }

  const action = await prisma.actionRequired.update({
    where: { id },
    data: req.body,
  });

  if (Object.keys(changes).length > 0) {
    // Audit logging removed for MVP
  }

  res.json(action);
}));

app.post('/api/actions/:id/clear', authenticate, requireChangeRationale, asyncHandler(async (req: ChangeRationaleRequest & AuthRequest, res) => {
  const { id } = req.params;
  const { rationale } = req;
  const changedBy = req.user?.name || 'Unknown';

  const existingAction = await prisma.actionRequired.findUnique({
    where: { id },
  });

  if (!existingAction) {
    const error = new Error('Action not found') as any;
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Audit logging removed for MVP

  const action = await prisma.actionRequired.update({
    where: { id },
    data: {
      status: 'CLEARED',
      clearedAt: new Date(),
      clearedBy: changedBy,
      clearRationale: rationale,
    },
  });

  res.json(action);
}));

app.post("/api/templates/import", upload.single('file'), asyncHandler(async (req, res) => {
  try {
    // Check if investmentId is provided
    if (!req.body.investmentId) {
      return res.status(400).json({
        success: false,
        errors: ["investmentId parameter is required"],
        preview: null
      });
    }

    // Check if file is provided via multipart upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        errors: ["No Excel file provided"],
        preview: null
      });
    }

    const processor = new ExcelTemplateProcessor();
    
    // Process the Excel file
    const result = await processor.processExcelBuffer(req.file.buffer);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Verify investment exists
    const existingInvestment = await prisma.investment.findUnique({
      where: { id: req.body.investmentId }
    });
    
    if (!existingInvestment) {
      return res.status(404).json({
        success: false,
        errors: ["Investment not found"],
        preview: null
      });
    }
    
    // Update investment with Excel data
    const investmentData = result.data;
    
    const investment = await prisma.investment.update({
      where: { id: req.body.investmentId },
      data: {
        // Update basic fields
        companyName: investmentData.companyName,
        sector: investmentData.sector,
        stage: investmentData.stage,
        investmentType: investmentData.investmentType,
        committedCapitalLcl: investmentData.committedCapitalLcl,
        ownershipPercent: investmentData.ownershipPercent,
        roundSizeEur: investmentData.roundSizeEur,
        enterpriseValueEur: investmentData.enterpriseValueEur,
        currentFairValueEur: investmentData.currentFairValueEur,
        
        // Update runway calculation fields
        snapshotDate: investmentData.snapshotDate,
        cashAtSnapshot: investmentData.cashAtSnapshot,
        monthlyBurn: investmentData.monthlyBurn,
        calculatedRunwayMonths: investmentData.calculatedRunwayMonths,
        customersAtSnapshot: investmentData.customersAtSnapshot,
        arrAtSnapshot: investmentData.arrAtSnapshot,
        liquidityExpectation: investmentData.liquidityExpectation,
        expectedLiquidityDate: investmentData.expectedLiquidityDate,
        expectedLiquidityMultiple: investmentData.expectedLiquidityMultiple,
      }
    });

    // Forecast creation removed for MVP - returning preview data only

    // Return success response with preview data
    res.status(201).json({
      success: true,
      data: {
        investmentId: investment.id,
        companyName: investment.companyName,
        message: "Investment updated successfully from Excel template"
      }
    });
  } catch (error) {
    console.error("Excel template import error:", error);
    res.status(500).json({
      success: false,
      errors: ["Internal server error during Excel template processing"],
      preview: null
    });
  }
}));

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💓 Health check available at http://localhost:${PORT}/health`);
  console.log(`📊 Portfolio API at http://localhost:${PORT}/api/portfolio`);
  console.log(`📋 Excel template import at http://localhost:${PORT}/api/templates/import`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
