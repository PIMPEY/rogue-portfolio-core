import { PrismaClient, InvestmentType, InvestmentStatus, InvestmentStage, MetricType } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const companies = [
  {
    name: 'PayFlow Solutions',
    year: 2024,
    month: 0, // Jan 2024
    performance: 'strong',
  },
  {
    name: 'CreditEdge Analytics',
    year: 2024,
    month: 2, // Mar 2024
    performance: 'moderate',
  },
  {
    name: 'WealthVista',
    year: 2024,
    month: 5, // Jun 2024
    performance: 'struggling',
  },
  {
    name: 'InsureTech Pro',
    year: 2024,
    month: 7, // Aug 2024
    performance: 'strong',
  },
  {
    name: 'BlockChain Finance',
    year: 2024,
    month: 9, // Oct 2024
    performance: 'moderate',
  },
  {
    name: 'NeoBank Digital',
    year: 2024,
    month: 11, // Dec 2024
    performance: 'strong',
  },
  {
    name: 'LendingBridge',
    year: 2025,
    month: 1, // Feb 2025
    performance: 'struggling',
  },
  {
    name: 'FraudGuard AI',
    year: 2025,
    month: 3, // Apr 2025
    performance: 'strong',
  },
  {
    name: 'TradeTech Exchange',
    year: 2025,
    month: 6, // Jul 2025
    performance: 'moderate',
  },
  {
    name: 'ReguComply Suite',
    year: 2025,
    month: 9, // Oct 2025
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

  // Generate 5 years (Y1-Y5)
  for (let q = 1; q <= 5; q++) {
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

  console.log('🌱 Starting production seed...');
  console.log('Environment:', NODE_ENV);
  console.log('Railway Environment:', RAILWAY_ENVIRONMENT);
  console.log('⚠️  WARNING: Seeding database with demo data');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.forecastMetric.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.founder.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.founderUpdate.deleteMany();
  await prisma.investment.deleteMany();

  // Create 10 companies
  let icCounter = 1;
  for (const company of companies) {
    const investmentDate = new Date(company.year, company.month, 15); // 15th of each month
    const dealOwners = ['Sarah Chen', 'Marcus Rodriguez', 'Emily Thompson'];
    const dealOwner = dealOwners[Math.floor(Math.random() * dealOwners.length)];

    // Calculate how many quarters have passed since investment (for actuals)
    const now = new Date();
    const monthsSinceInvestment = (now.getFullYear() - company.year) * 12 + (now.getMonth() - company.month);
    const quartersSinceInvestment = Math.floor(monthsSinceInvestment / 3);

    console.log(`Creating ${company.name}...`);

    const investment = await prisma.investment.create({
      data: {
        icReference: `IC-${company.year}-${String(icCounter++).padStart(3, '0')}`,
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
            horizonQuarters: 5,
            rationale: 'Series A financial forecast - 5 year projection',
            metrics: {
              create: generateForecastMetrics(company.performance),
            },
          },
        },
      },
    });

    // Generate actuals for quarters since investment
    if (quartersSinceInvestment > 0) {
      const forecast = await prisma.forecast.findFirst({
        where: { investmentId: investment.id },
        include: { metrics: true }
      });

      if (forecast) {
        // Generate actuals with variance based on performance
        const varianceMultipliers = {
          strong: { min: 0.95, max: 1.15 }, // Beating forecast
          moderate: { min: 0.90, max: 1.05 }, // Close to forecast
          struggling: { min: 0.60, max: 0.85 }, // Missing forecast
        };

        const variance = varianceMultipliers[company.performance as keyof typeof varianceMultipliers];

        for (let q = 1; q <= Math.min(quartersSinceInvestment, 5); q++) {
          const forecastRevenue = forecast.metrics.find(m => m.metric === 'REVENUE' && m.quarterIndex === q)?.value || 0;
          const forecastBurn = forecast.metrics.find(m => m.metric === 'BURN' && m.quarterIndex === q)?.value || 0;
          const forecastTraction = forecast.metrics.find(m => m.metric === 'TRACTION' && m.quarterIndex === q)?.value || 0;

          const actualMultiplier = variance.min + Math.random() * (variance.max - variance.min);

          await prisma.founderUpdate.create({
            data: {
              investmentId: investment.id,
              quarterIndex: q,
              dueDate: new Date(investmentDate.getTime() + q * 90 * 24 * 60 * 60 * 1000),
              submittedAt: new Date(investmentDate.getTime() + q * 90 * 24 * 60 * 60 * 1000),
              status: 'SUBMITTED',
              actualRevenue: Math.round(forecastRevenue * actualMultiplier),
              actualBurn: Math.round(forecastBurn * (company.performance === 'struggling' ? 1.2 : 1.0)),
              actualRunwayMonths: company.performance === 'struggling' ? 10 : company.performance === 'moderate' ? 16 : 22,
              actualTraction: Math.round(forecastTraction * actualMultiplier),
            }
          });
        }
      }
    }

    console.log(`✓ Created ${company.name} with ${quartersSinceInvestment} quarters of actuals (${investment.id})`);
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
