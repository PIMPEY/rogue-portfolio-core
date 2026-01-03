import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler';
import { authenticate, AuthRequest } from './middleware/auth';
import { requireChangeRationale, ChangeRationaleRequest } from './middleware/changeRationale';
import { logInvestmentUpdate, logValuationUpdate, logActionRequiredUpdate, logActionRequiredCleared } from './lib/auditLogger';
import { handler as presignedUrlHandler } from './api/documents/presigned-url/route';
import { handler as uploadCompleteHandler } from './api/documents/upload-complete/route';
import { handler as startReviewHandler } from './api/review/start/route';
import { handler as reviewJobHandler } from './api/review/[id]/route';
import { handler as analyzeHandler } from './api/review/analyze/route';
import { handler as analyzeDirectHandler } from './api/review/analyze-direct/route';
import ExcelTemplateProcessor from './excel-template-processor';

console.log('🚀 Starting backend server...');
console.log('📝 Environment:', process.env.NODE_ENV || 'development');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🔧 Port configured:', PORT);
console.log('🗄️  Database URL configured:', process.env.DATABASE_URL ? '✅ Yes' : '❌ No');

app.use(cors());
app.use(express.json());

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

app.post('/api/documents/presigned-url', asyncHandler(presignedUrlHandler));
app.post('/api/documents/upload-complete', asyncHandler(uploadCompleteHandler));
app.post('/api/review/start', asyncHandler(startReviewHandler));
app.get('/api/review/:id', asyncHandler(reviewJobHandler));
app.post('/api/review/:id', asyncHandler(reviewJobHandler));
app.post('/api/review/analyze', asyncHandler(analyzeHandler));
app.post('/api/review/analyze-direct', asyncHandler(analyzeDirectHandler));

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
      geography: inv.geography,
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
    geography: investment.geography,
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
      dealOwner: investment.dealOwner || "Unknown",
      geography: investment.geography || "Unknown",
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
          uploadedBy: investment.dealOwner || "Unknown",
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
      changedBy: investment.dealOwner || 'Unknown',
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
    await logInvestmentUpdate(id, changes, rationale, changedBy);
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

  await logValuationUpdate(investmentId, existingInvestment.currentFairValueEur, fairValueEur, rationale, changedBy);

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
    await logActionRequiredUpdate(existingAction.investmentId, id, changes, rationale, changedBy);
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

  await logActionRequiredCleared(existingAction.investmentId, id, rationale, changedBy);

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

app.post('/api/templates/import', asyncHandler(async (req, res) => {
  try {
    const processor = new ExcelTemplateProcessor();
    
    // Check if file is provided
    if (!req.body.file || !req.body.file.buffer) {
      return res.status(400).json({
        success: false,
        errors: ['No Excel file provided'],
        preview: null
      });
    }

    // Process the Excel file
    const result = await processor.processExcelBuffer(req.body.file.buffer);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Create investment record in database
    const investmentData = result.data;
    
    // Map Excel data to Investment model
    const investment = await prisma.investment.create({
      data: {
        companyName: investmentData.companyName,
        sector: investmentData.sector,
        stage: investmentData.stage,
        investmentType: investmentData.investmentType,
        committedCapitalLcl: investmentData.committedCapitalLcl,
        ownershipPercent: investmentData.ownershipPercent,
        roundSizeEur: investmentData.roundSizeEur,
        enterpriseValueEur: investmentData.enterpriseValueEur,
        currentFairValueEur: investmentData.currentFairValueEur,
        
        // Runway calculation fields
        snapshotDate: investmentData.snapshotDate,
        cashAtSnapshot: investmentData.cashAtSnapshot,
        monthlyBurn: investmentData.monthlyBurn,
        calculatedRunwayMonths: investmentData.calculatedRunwayMonths,
        customersAtSnapshot: investmentData.customersAtSnapshot,
        arrAtSnapshot: investmentData.arrAtSnapshot,
        liquidityExpectation: investmentData.liquidityExpectation,
        expectedLiquidityDate: investmentData.expectedLiquidityDate,
        expectedLiquidityMultiple: investmentData.expectedLiquidityMultiple,
        
        // Required fields with defaults
        icReference: `IC-${Date.now()}`,
        icApprovalDate: new Date(),
        investmentExecutionDate: new Date(),
      }
    });

    // Create forecast data if projections exist
    if (investmentData.revenueY1 || investmentData.ebitdaY1) {
      const forecast = await prisma.forecast.create({
        data: {
          investmentId: investment.id,
          version: 1,
          startQuarter: new Date(),
          horizonQuarters: 5,
          rationale: 'Imported from Excel template',
          metrics: {
            create: [
              // Revenue metrics
              ...(investmentData.revenueY1 ? [{ metric: 'REVENUE', quarterIndex: 0, value: investmentData.revenueY1 }] : []),
              ...(investmentData.revenueY2 ? [{ metric: 'REVENUE', quarterIndex: 1, value: investmentData.revenueY2 }] : []),
              ...(investmentData.revenueY3 ? [{ metric: 'REVENUE', quarterIndex: 2, value: investmentData.revenueY3 }] : []),
              ...(investmentData.revenueY4 ? [{ metric: 'REVENUE', quarterIndex: 3, value: investmentData.revenueY4 }] : []),
              ...(investmentData.revenueY5 ? [{ metric: 'REVENUE', quarterIndex: 4, value: investmentData.revenueY5 }] : []),
              
              // COGS metrics
              ...(investmentData.cogsY1 ? [{ metric: 'COGS', quarterIndex: 0, value: investmentData.cogsY1 }] : []),
              ...(investmentData.cogsY2 ? [{ metric: 'COGS', quarterIndex: 1, value: investmentData.cogsY2 }] : []),
              ...(investmentData.cogsY3 ? [{ metric: 'COGS', quarterIndex: 2, value: investmentData.cogsY3 }] : []),
              ...(investmentData.cogsY4 ? [{ metric: 'COGS', quarterIndex: 3, value: investmentData.cogsY4 }] : []),
              ...(investmentData.cogsY5 ? [{ metric: 'COGS', quarterIndex: 4, value: investmentData.cogsY5 }] : []),
              
              // EBITDA metrics
              ...(investmentData.ebitdaY1 ? [{ metric: 'EBITDA', quarterIndex: 0, value: investmentData.ebitdaY1 }] : []),
              ...(investmentData.ebitdaY2 ? [{ metric: 'EBITDA', quarterIndex: 1, value: investmentData.ebitdaY2 }] : []),
              ...(investmentData.ebitdaY3 ? [{ metric: 'EBITDA', quarterIndex: 2, value: investmentData.ebitdaY3 }] : []),
              ...(investmentData.ebitdaY4 ? [{ metric: 'EBITDA', quarterIndex: 3, value: investmentData.ebitdaY4 }] : []),
              ...(investmentData.ebitdaY5 ? [{ metric: 'EBITDA', quarterIndex: 4, value: investmentData.ebitdaY5 }] : []),
            ]
          }
        }
      });
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        investmentId: investment.id,
        action: 'INVESTMENT_CREATED',
        rationale: 'Investment created from Excel template import',
        changedBy: 'System',
      }
    });

    res.status(201).json({
      success: true,
      data: {
        investmentId: investment.id,
        companyName: investment.companyName,
        message: 'Investment created successfully from Excel template'
      },
      errors: []
    });

  } catch (error: any) {
    console.error('Excel template import error:', error);
    res.status(500).json({
      success: false,
      errors: [`Failed to import Excel template: ${error.message}`],
      preview: null
    });
  }
}));

app.use(notFoundHandler);
app.use(errorHandler);

// Start server and test database connection
async function startServer() {
  console.log('🚀 Starting HTTP server...');
  
  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log('✅ Backend server running on port', PORT);
    console.log('🌐 Server address: http://0.0.0.0:' + PORT);
    console.log('🏥 Health check: http://0.0.0.0:' + PORT + '/health');
  });

  server.on('error', (err: any) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // Test database connection AFTER server starts
  try {
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    console.error('📋 DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET');
    console.error('⚠️  Server is running but database is unavailable!');
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('👋 SIGTERM received, closing server...');
    await prisma.$disconnect();
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('❌ Fatal error starting server:', err);
  process.exit(1);
});


