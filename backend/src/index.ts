import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      include: {
        founders: true,
        cashflows: true,
        valuations: true,
        flags: true,
      },
    });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

app.get('/api/investments', async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

app.get('/api/investments/:id', async (req, res) => {
  try {
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
      return res.status(404).json({ error: 'Investment not found' });
    }
    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investment' });
  }
});

app.post('/api/investments', async (req, res) => {
  try {
    const investment = await prisma.investment.create({
      data: req.body,
    });
    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

app.put('/api/investments/:id', async (req, res) => {
  try {
    const investment = await prisma.investment.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

app.get('/api/actions', async (req, res) => {
  try {
    const actions = await prisma.actionRequired.findMany({
      include: { investment: true },
      orderBy: { reviewDate: 'asc' },
    });
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

app.get('/api/actions/:id', async (req, res) => {
  try {
    const action = await prisma.actionRequired.findUnique({
      where: { id: req.params.id },
      include: { investment: true },
    });
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }
    res.json(action);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch action' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
