import { PrismaClient, InvestmentType, InvestmentStatus, FlagType, MetricType } from '@prisma/client';
import { evaluateFlags } from '../src/lib/flagEngine';

const prisma = new PrismaClient();

const sectors = ['SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'AI/ML', 'ClimateTech', 'EdTech', 'Cybersecurity'];
const stages = ['Pre-Seed', 'Seed', 'Series A', 'Series B'];
const investmentTypes = [InvestmentType.SAFE, InvestmentType.CLN, InvestmentType.EQUITY];

const companyNames = [
  'CloudSync AI', 'PayFlow Pro', 'MediTrack', 'ShopGenius', 'NeuralNet Labs',
  'GreenEnergy Co', 'LearnFast', 'SecureShield', 'DataPulse', 'FinTech Hub',
  'HealthFirst', 'RetailMax', 'AutoML Systems', 'CleanWater Tech', 'EduSpark',
  'CyberGuard', 'CloudScale', 'PayStream', 'MediConnect', 'SmartRetail'
];

async function main() {
  console.log('Starting seed...');

  for (let i = 0; i < 20; i++) {
    const companyName = companyNames[i];
    const sector = sectors[i % sectors.length];
    const stage = stages[i % stages.length];
    const investmentType = investmentTypes[i % investmentTypes.length];
    const investmentAmount = 500000 + Math.random() * 2000000;
    const investmentDate = new Date(2024, Math.floor(Math.random() * 12), 1);

    const investment = await prisma.investment.create({
      data: {
        companyName,
        sector,
        stage,
        investmentAmount,
        currency: 'USD',
        investmentType,
        investmentDate,
        status: InvestmentStatus.ACTIVE,
        founders: {
          create: {
            name: `Founder ${i + 1}`,
            email: `founder${i + 1}@${companyName.toLowerCase().replace(/\s/g, '')}.com`
          }
        }
      }
    });

    console.log(`Created investment: ${companyName}`);

    const forecast = await prisma.forecast.create({
      data: {
        investmentId: investment.id,
        version: 1,
        startQuarter: investmentDate,
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
          dueDate: new Date(investmentDate.getTime() + q * 90 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(investmentDate.getTime() + q * 90 * 24 * 60 * 60 * 1000),
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
