import { PrismaClient, InvestmentType, InvestmentStatus, InvestmentStage, MetricType } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const companies = [
  {
    name: 'PayFlow Solutions',
    investmentMonth: 0, // Jan 2024
    performance: 'strong', // Strong revenue growth, positive trajectory
  },
  {
    name: 'CreditEdge Analytics',
    investmentMonth: 1, // Feb 2024
    performance: 'moderate', // Steady growth
  },
  {
    name: 'WealthVista',
    investmentMonth: 2, // Mar 2024
    performance: 'struggling', // Higher burn, slower revenue
  },
  {
    name: 'InsureTech Pro',
    investmentMonth: 3, // Apr 2024
    performance: 'strong',
  },
  {
    name: 'BlockChain Finance',
    investmentMonth: 4, // May 2024
    performance: 'moderate',
  },
  {
    name: 'NeoBank Digital',
    investmentMonth: 5, // Jun 2024
    performance: 'strong',
  },
  {
    name: 'LendingBridge',
    investmentMonth: 6, // Jul 2024
    performance: 'struggling',
  },
  {
    name: 'FraudGuard AI',
    investmentMonth: 7, // Aug 2024
    performance: 'strong',
  },
  {
    name: 'TradeTech Exchange',
    investmentMonth: 8, // Sep 2024
    performance: 'moderate',
  },
  {
    name: 'ReguComply Suite',
    investmentMonth: 9, // Oct 2024
    performance: 'moderate',
  },
];

function generateForecastMetrics(performance: string) {
  const metrics: Array<{ metric: MetricType; quarterIndex: number; value: number }> = [];

  // Base values
  let baseRevenue = 50000;
  let baseCOGS = 15000;
  let baseOPEX = 80000;
  let baseCAPEX = 10000;
  let baseCashBalance = 1500000;
  let baseCustomers = 50;

  // Growth rates based on performance
  const growthRates = {
    strong: { revenue: 1.25, cogs: 1.15, opex: 1.08, capex: 1.05, customers: 1.30 },
    moderate: { revenue: 1.15, cogs: 1.12, opex: 1.10, capex: 1.05, customers: 1.20 },
    struggling: { revenue: 1.08, cogs: 1.10, opex: 1.12, capex: 1.03, customers: 1.10 },
  };

  const rates = growthRates[performance as keyof typeof growthRates];

  // Generate 20 quarters (5 years)
  for (let q = 1; q <= 20; q++) {
    const revenue = Math.round(baseRevenue * Math.pow(rates.revenue, q - 1));
    const cogs = Math.round(baseCOGS * Math.pow(rates.cogs, q - 1));
    const opex = Math.round(baseOPEX * Math.pow(rates.opex, q - 1));
    const capex = Math.round(baseCAPEX * Math.pow(rates.capex, q - 1));
    const ebitda = revenue - cogs - opex - capex;
    const customers = Math.round(baseCustomers * Math.pow(rates.customers, q - 1));

    // Cash balance depletes based on EBITDA
    baseCashBalance = baseCashBalance + ebitda;
    const cashBalance = Math.max(0, baseCashBalance);

    metrics.push(
      { metric: 'REVENUE' as MetricType, quarterIndex: q, value: revenue },
      { metric: 'COGS' as MetricType, quarterIndex: q, value: cogs },
      { metric: 'OPEX' as MetricType, quarterIndex: q, value: opex },
      { metric: 'CAPEX' as MetricType, quarterIndex: q, value: capex },
      { metric: 'EBITDA' as MetricType, quarterIndex: q, value: ebitda },
      { metric: 'BURN' as MetricType, quarterIndex: q, value: cashBalance },
      { metric: 'TRACTION' as MetricType, quarterIndex: q, value: customers }
    );
  }

  return metrics;
}

async function main() {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const RAILWAY_ENVIRONMENT = process.env.RAILWAY_ENVIRONMENT_NAME || 'unknown';

  if (NODE_ENV === 'production' || RAILWAY_ENVIRONMENT === 'production') {
    console.error('❌ SEEDING BLOCKED: Cannot seed database in production environment');
    console.error('   NODE_ENV:', NODE_ENV);
    console.error('   RAILWAY_ENVIRONMENT:', RAILWAY_ENVIRONMENT);
    console.error('   Seeding is only allowed in development/staging environments');
    process.exit(1);
  }

  console.log('🌱 Starting seed...');
  console.log('Environment:', NODE_ENV);

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.forecastMetric.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.founder.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.founderUpdate.deleteMany();
  await prisma.investment.deleteMany();

  // Create 10 companies
  for (const company of companies) {
    const investmentDate = new Date(2024, company.investmentMonth, 15); // 15th of each month
    const dealOwners = ['Sarah Chen', 'Marcus Rodriguez', 'Emily Thompson'];
    const dealOwner = dealOwners[Math.floor(Math.random() * dealOwners.length)];

    console.log(`Creating ${company.name}...`);

    const investment = await prisma.investment.create({
      data: {
        icReference: `IC-2024-${String(company.investmentMonth + 1).padStart(3, '0')}`,
        icApprovalDate: new Date(investmentDate.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks before
        investmentExecutionDate: investmentDate,
        companyName: company.name,
        sector: 'FinTech',
        stage: 'SERIES_A' as InvestmentStage,
        geography: 'Europe',
        investmentType: 'EQUITY' as InvestmentType,
        committedCapitalLcl: 2000000,
        deployedCapitalLcl: 2000000,
        ownershipPercent: 15.0,
        coInvestors: null,
        hasBoardSeat: true,
        hasProRataRights: true,
        hasAntiDilutionProtection: true,
        roundSizeEur: 5000000,
        enterpriseValueEur: 20000000,
        currentFairValueEur: 2000000,
        snapshotDate: investmentDate,
        cashAtSnapshot: 1500000,
        monthlyBurn: company.performance === 'struggling' ? 120000 : company.performance === 'moderate' ? 80000 : 50000,
        calculatedRunwayMonths: company.performance === 'struggling' ? 12 : company.performance === 'moderate' ? 18 : 24,
        customersAtSnapshot: 50,
        arrAtSnapshot: 600000,
        liquidityExpectation: 'Series B',
        expectedLiquidityDate: new Date(2026, 6, 1), // Mid 2026
        expectedLiquidityMultiple: 3.0,
        raisedFollowOnCapital: false,
        clearProductMarketFit: company.performance !== 'struggling',
        meaningfulRevenue: true,
        status: 'ACTIVE' as InvestmentStatus,
        founders: {
          create: [
            {
              name: `${company.name.split(' ')[0]} Founder`,
              email: `founder@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            },
          ],
        },
        forecasts: {
          create: {
            version: 1,
            startQuarter: investmentDate,
            horizonQuarters: 20,
            rationale: 'Series A financial forecast - 5 year projection',
            metrics: {
              create: generateForecastMetrics(company.performance),
            },
          },
        },
      },
    });

    console.log(`✓ Created ${company.name} (${investment.id})`);
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
