import { PrismaClient, InvestmentType, InvestmentStatus, InvestmentStage, FlagType, MetricType, CashflowType } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const sectors = ['SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'AI/ML', 'ClimateTech', 'EdTech', 'Cybersecurity'];
const stages = [InvestmentStage.PRE_SEED, InvestmentStage.SEED, InvestmentStage.SERIES_A, InvestmentStage.SERIES_B];
const investmentTypes = [InvestmentType.SAFE, InvestmentType.CLN, InvestmentType.EQUITY];
const geographies = ['US', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE'];

const companyNames = [
  'CloudSync AI', 'PayFlow Pro', 'MediTrack', 'ShopGenius', 'NeuralNet Labs',
  'GreenEnergy Co', 'LearnFast', 'SecureShield', 'DataPulse', 'FinTech Hub',
  'HealthFirst', 'RetailMax', 'AutoML Systems', 'CleanWater Tech', 'EduSpark',
  'CyberGuard', 'CloudScale', 'PayStream', 'MediConnect', 'SmartRetail'
];

async function seedProduction() {
  console.log('🌱 Starting production seed...');
  console.log('⚠️  This will add demo data to the database');

  // Check if database already has data
  const existingCount = await prisma.investment.count();
  
  if (existingCount > 0) {
    console.log(`⚠️  Database already has ${existingCount} investments`);
    console.log('💡 Skipping seed to avoid duplicates. Call /api/clear-db first if you want to reseed.');
    return { success: true, message: `Database already has ${existingCount} investments. Call /api/clear-db to reset.`, count: existingCount };
  }

  console.log('📊 Creating 20 demo investments...');
  let createdCount = 0;

  for (let i = 0; i < 20; i++) {
    const companyName = companyNames[i];
    const sector = sectors[i % sectors.length];
    const stage = stages[i % stages.length];
    const investmentType = investmentTypes[i % investmentTypes.length];
    const geography = geographies[i % geographies.length];
    const committedCapitalLcl = 500000 + Math.random() * 2000000;
    const investmentExecutionDate = new Date(2024, Math.floor(Math.random() * 12), 1);
    const icApprovalDate = new Date(investmentExecutionDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const icReference = String(i + 1).padStart(5, '0');

    const investment = await prisma.investment.create({
      data: {
        icReference,
        icApprovalDate,
        investmentExecutionDate,
        dealOwner: 'PJI',
        companyName,
        sector,
        geography,
        stage,
        investmentType,
        committedCapitalLcl,
        deployedCapitalLcl: committedCapitalLcl,
        ownershipPercent: investmentType === InvestmentType.EQUITY ? 5 + Math.random() * 15 : null,
        localCurrency: 'USD',
        investmentFxRate: 1.08,
        investmentFxSource: 'ECB',
        valuationFxRate: 1.08,
        valuationFxSource: 'ECB',
        roundSizeEur: committedCapitalLcl * 1.08 * (2 + Math.random()),
        currentFairValueEur: committedCapitalLcl * 1.08,
        status: InvestmentStatus.ACTIVE,
        founders: {
          create: {
            name: `Founder ${i + 1}`,
            email: `founder${i + 1}@${companyName.toLowerCase().replace(/\s/g, '')}.com`
          }
        },
        cashflows: {
          create: {
            type: CashflowType.INITIAL_INVESTMENT,
            amountLcl: committedCapitalLcl,
            amountEur: committedCapitalLcl * 1.08,
            date: investmentExecutionDate,
            description: 'Initial investment'
          }
        }
      }
    });

    console.log(`✓ Created investment: ${companyName}`);
    createdCount++;

    // Create forecast
    const forecast = await prisma.forecast.create({
      data: {
        investmentId: investment.id,
        version: 1,
        startQuarter: investmentExecutionDate,
        horizonQuarters: 8
      }
    });

    const baseRevenue = 10000 + Math.random() * 50000;
    const baseBurn = 50000 + Math.random() * 100000;
    const baseTraction = 100 + Math.random() * 1000;

    // Create forecast metrics
    for (let q = 0; q < 8; q++) {
      const growthFactor = 1 + (q * 0.15);
      
      // Revenue metric
      await prisma.forecastMetric.create({
        data: {
          forecastId: forecast.id,
          metric: MetricType.REVENUE,
          quarterIndex: q,
          value: baseRevenue * growthFactor
        }
      });

      // Burn metric
      await prisma.forecastMetric.create({
        data: {
          forecastId: forecast.id,
          metric: MetricType.BURN,
          quarterIndex: q,
          value: baseBurn * (1 - q * 0.05)
        }
      });

      // Traction metric
      await prisma.forecastMetric.create({
        data: {
          forecastId: forecast.id,
          metric: MetricType.TRACTION,
          quarterIndex: q,
          value: baseTraction * growthFactor * 1.2
        }
      });
    }

    // Add some flags for variety
    if (i % 3 === 0) {
      await prisma.flag.create({
        data: {
          investmentId: investment.id,
          type: FlagType.RUNWAY_RISK,
          severity: i % 2 === 0 ? 'HIGH' : 'MEDIUM',
          description: 'Low runway - requires monitoring',
          status: 'NEW'
        }
      });
    }

    if (i % 5 === 0) {
      await prisma.flag.create({
        data: {
          investmentId: investment.id,
          type: FlagType.BURN_SPIKE,
          severity: 'MEDIUM',
          description: 'Recent burn rate increase',
          status: 'NEW'
        }
      });
    }
  }

  console.log(`✅ Successfully seeded ${createdCount} investments`);
  return { success: true, message: `Successfully seeded ${createdCount} investments`, count: createdCount };
}

// Run if called directly
if (require.main === module) {
  seedProduction()
    .then((result) => {
      console.log(result);
      process.exit(0);
    })
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedProduction };
