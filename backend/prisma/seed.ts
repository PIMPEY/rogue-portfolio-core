import { PrismaClient, InvestmentType, InvestmentStatus, InvestmentStage, FlagType, MetricType, CashflowType } from '@prisma/client';
import { evaluateFlags } from '../src/lib/flagEngine';
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

  console.log('Starting seed...');
  console.log('Environment:', NODE_ENV);

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

    console.log(`Created investment: ${companyName}`);

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

    for (let q = 1; q <= 8; q++) {
      const revenueGrowth = 1.2 + Math.random() * 0.3;
      const burnGrowth = 1.05 + Math.random() * 0.1;
      const tractionGrowth = 1.3 + Math.random() * 0.4;

      await prisma.forecastMetric.createMany({
        data: [
          {
            forecastId: forecast.id,
            metric: MetricType.REVENUE,
            quarterIndex: q,
            value: baseRevenue * Math.pow(revenueGrowth, q - 1)
          },
          {
            forecastId: forecast.id,
            metric: MetricType.BURN,
            quarterIndex: q,
            value: baseBurn * Math.pow(burnGrowth, q - 1)
          },
          {
            forecastId: forecast.id,
            metric: MetricType.TRACTION,
            quarterIndex: q,
            value: baseTraction * Math.pow(tractionGrowth, q - 1)
          }
        ]
      });
    }

    const numUpdates = Math.floor(Math.random() * 4) + 1;

    for (let q = 1; q <= numUpdates; q++) {
      const forecastMetrics = await prisma.forecastMetric.findMany({
        where: { forecastId: forecast.id, quarterIndex: q }
      });

      const forecastRevenue = forecastMetrics.find(m => m.metric === MetricType.REVENUE)?.value || 0;
      const forecastBurn = forecastMetrics.find(m => m.metric === MetricType.BURN)?.value || 0;
      const forecastTraction = forecastMetrics.find(m => m.metric === MetricType.TRACTION)?.value || 0;

      const variance = 0.6 + Math.random() * 0.8;
      const actualRevenue = forecastRevenue * variance;
      const actualBurn = forecastBurn * (0.9 + Math.random() * 0.5);
      const actualTraction = forecastTraction * variance;
      const actualRunwayMonths = 3 + Math.random() * 12;

      const update = await prisma.founderUpdate.create({
        data: {
          investmentId: investment.id,
          quarterIndex: q,
          dueDate: new Date(investmentExecutionDate.getTime() + q * 90 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(investmentExecutionDate.getTime() + q * 90 * 24 * 60 * 60 * 1000),
          status: 'SUBMITTED',
          actualRevenue,
          actualBurn,
          actualRunwayMonths,
          actualTraction,
          narrativeGood: 'Strong customer acquisition',
          narrativeBad: 'Higher than expected burn',
          narrativeHelp: 'Need help with hiring'
        }
      });

      const flagResult = evaluateFlags(
        { revenue: forecastRevenue, burn: forecastBurn, traction: forecastTraction },
        { revenue: actualRevenue, burn: actualBurn, traction: actualTraction, runwayMonths: actualRunwayMonths }
      );

      for (const flag of flagResult.flags) {
        const metricMap: Record<string, MetricType> = {
          'revenue': MetricType.REVENUE,
          'burn': MetricType.BURN,
          'traction': MetricType.TRACTION,
          'headcount': MetricType.HEADCOUNT
        };

        await prisma.flag.create({
          data: {
            investmentId: investment.id,
            founderUpdateId: update.id,
            type: flag.type as FlagType,
            metric: flag.metric ? metricMap[flag.metric] : null,
            threshold: flag.threshold,
            actualValue: flag.actualValue,
            forecastValue: flag.forecastValue,
            deltaPct: flag.deltaPct,
            status: flagResult.status === 'RED' ? 'NEW' : flagResult.status === 'AMBER' ? 'MONITORING' : 'RESOLVED'
          }
        });
      }
    }

    console.log(`Created forecast and ${numUpdates} updates for ${companyName}`);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
