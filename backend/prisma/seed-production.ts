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
    sector: 'FinTech',
    stage: 'SERIES_A' as InvestmentStage,
    geography: 'UK',
    investmentType: 'EQUITY' as InvestmentType,
    committedCapital: 2000000,
    deployedCapital: 2000000,
    ownership: 15.0,
    roundSize: 5000000,
    enterpriseValue: 20000000,
    initialCash: 1500000,
  },
  {
    name: 'HealthTech Diagnostics',
    year: 2024,
    month: 1, // Feb 2024
    performance: 'strong',
    sector: 'HealthTech',
    stage: 'SEED' as InvestmentStage,
    geography: 'Germany',
    investmentType: 'SAFE' as InvestmentType,
    committedCapital: 500000,
    deployedCapital: 500000,
    ownership: 8.0,
    roundSize: 2000000,
    enterpriseValue: 6000000,
    initialCash: 800000,
  },
  {
    name: 'GreenEnergy AI',
    year: 2024,
    month: 3, // Apr 2024
    performance: 'moderate',
    sector: 'CleanTech',
    stage: 'SERIES_A' as InvestmentStage,
    geography: 'Netherlands',
    investmentType: 'EQUITY' as InvestmentType,
    committedCapital: 3000000,
    deployedCapital: 2500000,
    ownership: 12.0,
    roundSize: 8000000,
    enterpriseValue: 35000000,
    initialCash: 2000000,
  },
  {
    name: 'EduTech Platform',
    year: 2024,
    month: 4, // May 2024
    performance: 'struggling',
    sector: 'EdTech',
    stage: 'SERIES_A' as InvestmentStage,
    geography: 'Spain',
    investmentType: 'EQUITY' as InvestmentType,
    committedCapital: 1500000,
    deployedCapital: 1500000,
    ownership: 10.0,
    roundSize: 4000000,
    enterpriseValue: 15000000,
    initialCash: 1200000,
  },
  {
    name: 'LogiChain Solutions',
    year: 2024,
    month: 6, // Jul 2024
    performance: 'moderate',
    sector: 'Logistics',
    stage: 'SERIES_B' as InvestmentStage,
    geography: 'France',
    investmentType: 'EQUITY' as InvestmentType,
    committedCapital: 5000000,
    deployedCapital: 5000000,
    ownership: 8.5,
    roundSize: 15000000,
    enterpriseValue: 80000000,
    initialCash: 5000000,
  },
  {
    name: 'CyberShield Security',
    year: 2024,
    month: 8, // Sep 2024
    performance: 'strong',
    sector: 'CyberSecurity',
    stage: 'SERIES_A' as InvestmentStage,
    geography: 'UK',
    investmentType: 'EQUITY' as InvestmentType,
    committedCapital: 2500000,
    deployedCapital: 2500000,
    ownership: 14.0,
    roundSize: 6000000,
    enterpriseValue: 25000000,
    initialCash: 2200000,
  },
  {
    name: 'FoodTech Innovations',
    year: 2024,
    month: 10, // Nov 2024
    performance: 'moderate',
    sector: 'FoodTech',
    stage: 'SEED' as InvestmentStage,
    geography: 'Sweden',
    investmentType: 'SAFE' as InvestmentType,
    committedCapital: 750000,
    deployedCapital: 750000,
    ownership: 12.0,
    roundSize: 2500000,
    enterpriseValue: 8000000,
    initialCash: 1000000,
  },
  {
    name: 'PropTech Ventures',
    year: 2025,
    month: 0, // Jan 2025
    performance: 'struggling',
    sector: 'PropTech',
    stage: 'SERIES_A' as InvestmentStage,
    geography: 'Ireland',
    investmentType: 'CLN' as InvestmentType,
    committedCapital: 1800000,
    deployedCapital: 1800000,
    ownership: 11.0,
    roundSize: 5000000,
    enterpriseValue: 18000000,
    initialCash: 1500000,
  },
  {
    name: 'AI Robotics Labs',
    year: 2025,
    month: 2, // Mar 2025
    performance: 'strong',
    sector: 'DeepTech',
    stage: 'SERIES_B' as InvestmentStage,
    geography: 'Switzerland',
    investmentType: 'EQUITY' as InvestmentType,
    committedCapital: 7000000,
    deployedCapital: 7000000,
    ownership: 9.0,
    roundSize: 20000000,
    enterpriseValue: 100000000,
    initialCash: 8000000,
  },
  {
    name: 'InsureTech Connect',
    year: 2025,
    month: 5, // Jun 2025
    performance: 'moderate',
    sector: 'InsurTech',
    stage: 'SEED' as InvestmentStage,
    geography: 'Denmark',
    investmentType: 'EQUITY' as InvestmentType,
    committedCapital: 600000,
    deployedCapital: 600000,
    ownership: 10.0,
    roundSize: 2000000,
    enterpriseValue: 7000000,
    initialCash: 900000,
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

    // Calculate realistic monthly burn based on stage and performance
    const baseBurn = company.stage === 'SEED' ? 40000 : company.stage === 'SERIES_A' ? 80000 : 150000;
    const burnMultiplier = company.performance === 'struggling' ? 1.5 : company.performance === 'moderate' ? 1.0 : 0.7;
    const monthlyBurn = Math.round(baseBurn * burnMultiplier);

    // Calculate runway: (initial cash + deployed capital) / monthly burn
    const totalCash = company.initialCash + (company.deployedCapital - company.committedCapital);
    const calculatedRunway = Math.round(totalCash / monthlyBurn);

    // Calculate current fair value with markup/markdown based on performance
    const fairValueMultiplier = company.performance === 'strong' ? 1.3 : company.performance === 'moderate' ? 1.0 : 0.7;
    const currentFairValue = Math.round(company.committedCapital * fairValueMultiplier);

    // Determine next round based on stage
    const nextRound = company.stage === 'SEED' ? 'Series A' : company.stage === 'SERIES_A' ? 'Series B' : 'Series C';

    const investment = await prisma.investment.create({
      data: {
        icReference: `IC-${company.year}-${String(icCounter++).padStart(3, '0')}`,
        icApprovalDate: new Date(investmentDate.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks before
        investmentExecutionDate: investmentDate,
        companyName: company.name,
        sector: company.sector,
        stage: company.stage,
        geography: company.geography,
        investmentType: company.investmentType,
        committedCapitalLcl: company.committedCapital,
        deployedCapitalLcl: company.deployedCapital,
        ownershipPercent: company.ownership,
        coInvestors: company.stage === 'SERIES_B' ? 'Accel Partners, Index Ventures' : null,
        hasBoardSeat: company.stage !== 'SEED',
        hasProRataRights: true,
        hasAntiDilutionProtection: company.stage !== 'SEED',
        roundSizeEur: company.roundSize,
        enterpriseValueEur: company.enterpriseValue,
        currentFairValueEur: currentFairValue,
        snapshotDate: investmentDate,
        cashAtSnapshot: company.initialCash,
        monthlyBurn: monthlyBurn,
        calculatedRunwayMonths: calculatedRunway,
        customersAtSnapshot: company.stage === 'SEED' ? 20 : company.stage === 'SERIES_A' ? 50 : 200,
        arrAtSnapshot: company.stage === 'SEED' ? 200000 : company.stage === 'SERIES_A' ? 600000 : 2500000,
        liquidityExpectation: nextRound,
        expectedLiquidityDate: new Date(investmentDate.getFullYear() + 2, investmentDate.getMonth(), 1),
        expectedLiquidityMultiple: company.performance === 'strong' ? 3.5 : company.performance === 'moderate' ? 2.5 : 1.5,
        raisedFollowOnCapital: company.stage === 'SERIES_B',
        clearProductMarketFit: company.performance !== 'struggling',
        meaningfulRevenue: company.stage !== 'SEED',
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
