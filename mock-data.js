// Mock Data System with Production Safety Controls
const MOCK_MODE = process.env.MOCK_MODE === 'true' || false;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Production safety check
if (NODE_ENV === 'production' && MOCK_MODE) {
  throw new Error('❌ CRITICAL: MOCK_MODE=true in production! This must be disabled before deploy.');
}

// Log startup mode
console.log(`🚀 Server starting in ${MOCK_MODE ? 'MOCK' : 'REAL'} mode`);
console.log(`📊 Environment: ${NODE_ENV}`);
if (MOCK_MODE) {
  console.log('⚠️ MOCK MODE ACTIVE - Using demo data');
}

// Mock data for portfolio
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
  },
  {
    id: '3',
    companyName: 'GreenEnergy Corp',
    sector: 'CLIMATE',
    status: 'GREEN',
    label: 'GreenEnergy Corp - Series A',
    investedAmount: 750000,
    currentValue: 900000,
    ownership: '12%',
    createdAt: '2024-03-10T00:00:00Z'
  }
];

const MOCK_PORTFOLIO_SUMMARY = {
  totalInvested: 1500000,
  totalValue: 1950000,
  totalCompanies: 3
};

// Mock investment details with thesis vs actuals
const MOCK_INVESTMENT_DETAILS = {
  '1': {
    investment: {
      id: '1',
      companyName: 'TechStartup AI',
      sector: 'AI_INFRA',
      stage: 'SERIES_A',
      status: 'GREEN',
      label: 'TechStartup AI - Series A',
      committedCapital: 500000,
      currentValue: 750000,
      ownership: '10%',
      valuation: 5000000,
      createdAt: '2024-01-15T00:00:00Z'
    },
    forecast: {
      revenue: [
        { quarterIndex: 1, value: 100000 },
        { quarterIndex: 2, value: 150000 },
        { quarterIndex: 3, value: 200000 },
        { quarterIndex: 4, value: 300000 }
      ],
      burn: [
        { quarterIndex: 1, value: 80000 },
        { quarterIndex: 2, value: 90000 },
        { quarterIndex: 3, value: 100000 },
        { quarterIndex: 4, value: 110000 }
      ],
      cash: [
        { quarterIndex: 1, value: 2000000 },
        { quarterIndex: 2, value: 1800000 },
        { quarterIndex: 3, value: 1600000 },
        { quarterIndex: 4, value: 1400000 }
      ],
      headcount: [
        { quarterIndex: 1, value: 15 },
        { quarterIndex: 2, value: 18 },
        { quarterIndex: 3, value: 22 },
        { quarterIndex: 4, value: 25 }
      ]
    },
    actuals: {
      revenue: [
        { quarter: 1, value: 95000 },
        { quarter: 2, value: 155000 },
        { quarter: 3, value: 210000 }
      ],
      burn: [
        { quarter: 1, value: 82000 },
        { quarter: 2, value: 88000 },
        { quarter: 3, value: 105000 }
      ],
      cash: [
        { quarter: 1, value: 1950000 },
        { quarter: 2, value: 1750000 },
        { quarter: 3, value: 1550000 }
      ],
      headcount: [
        { quarter: 1, value: 16 },
        { quarter: 2, value: 19 },
        { quarter: 3, value: 23 }
      ]
    },
    analysis: {
      summary: 'Investment in TechStartup AI - AI infrastructure sector. Strong technical team with proven track record.',
      extractedFacts: [
        { type: 'REVENUE', value: '€125,000 ARR', confidence: 0.9 },
        { type: 'BURN', value: '€75,000 monthly', confidence: 0.85 },
        { type: 'RUNWAY_MONTHS', value: '18 months', confidence: 0.8 },
        { type: 'HEADCOUNT', value: '15 employees', confidence: 0.9 }
      ],
      dataQuality: {
        score: 88,
        completeness: 85,
        confidence: 92,
        warnings: ['Some financial projections need validation']
      }
    }
  }
};

module.exports = {
  MOCK_MODE,
  MOCK_INVESTMENTS,
  MOCK_PORTFOLIO_SUMMARY,
  MOCK_INVESTMENT_DETAILS
};