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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
    },
  });
  res.json(investments);
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
  res.json(investment);
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
      ...investment,
      icReference: investment.icReference || `IC-${Date.now()}`,
    },
  });

  if (files && files.length > 0) {
    for (const file of files) {
      await prisma.document.create({
        data: {
          investmentId: createdInvestment.id,
          type: 'IC_MEMO',
          versionType: 'INITIAL',
          filePath: file.filePath,
          fileName: file.fileName,
          fileSize: file.fileSize,
          uploadedBy: investment.dealOwner,
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

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Server address: http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});
