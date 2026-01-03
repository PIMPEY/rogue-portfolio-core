const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Mock data for immediate testing
const MOCK_INVESTMENTS = [
  {
    id: '1',
    companyName: 'TechStartup AI',
    sector: 'AI_INFRA',
    status: 'GREEN',
    label: 'TechStartup AI - Series A',
    investedAmount: 500000,
    currentValue: 750000,
    ownership: '10%',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    companyName: 'HealthTech Solutions',
    sector: 'HEALTHCARE',
    status: 'AMBER',
    label: 'HealthTech Solutions - Seed',
    investedAmount: 250000,
    currentValue: 300000,
    ownership: '8%',
    createdAt: '2024-02-20T00:00:00Z'
  }
];

const MOCK_PORTFOLIO_SUMMARY = {
  totalInvested: 750000,
  totalValue: 1050000,
  totalCompanies: 2
};

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataMode: 'mock'
  });
});

// Get investments
app.get('/api/investments', (req, res) => {
  console.log('📊 Serving mock portfolio data');
  res.json({
    investments: MOCK_INVESTMENTS,
    summary: MOCK_PORTFOLIO_SUMMARY,
    dataMode: 'mock'
  });
});

// Get investment details
app.get('/api/investments/:id', (req, res) => {
  const investment = MOCK_INVESTMENTS.find(inv => inv.id === req.params.id);
  if (!investment) {
    return res.status(404).json({ error: 'Investment not found' });
  }

  res.json({
    investment: investment,
    forecast: {
      revenue: [{ quarterIndex: 1, value: 100000 }],
      burn: [{ quarterIndex: 1, value: 80000 }]
    },
    actuals: {
      revenue: [{ quarter: 1, value: 95000 }],
      burn: [{ quarter: 1, value: 82000 }]
    },
    analysis: {
      summary: 'Mock analysis data',
      extractedFacts: []
    },
    dataMode: 'mock'
  });
});

// Document analysis
app.post('/api/review/analyze-direct', (req, res) => {
  res.json({
    analysis: {
      summary: 'Mock analysis completed',
      metrics: { revenue: 125000, growth: 25 }
    },
    dataMode: 'mock'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`💼 Portfolio: http://localhost:${PORT}/api/investments`);
});