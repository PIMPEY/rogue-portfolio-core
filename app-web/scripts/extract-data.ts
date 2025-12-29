import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function extractData() {
  console.log('Extracting data from database...\n');

  const investments = await prisma.investment.findMany({
    include: {
      founders: true,
      forecasts: {
        include: {
          metrics: {
            orderBy: { quarterIndex: 'asc' }
          }
        },
        orderBy: { version: 'desc' },
        take: 1
      },
      founderUpdates: {
        orderBy: { quarterIndex: 'asc' }
      }
    },
    orderBy: { companyName: 'asc' }
  });

  const extractedData = investments.map(inv => {
    const forecast = inv.forecasts[0];
    const forecastMetrics = forecast?.metrics || [];

    const revenueForecast = forecastMetrics
      .filter(m => m.metric === 'REVENUE')
      .sort((a, b) => a.quarterIndex - b.quarterIndex)
      .map(m => ({ quarter: m.quarterIndex, value: m.value }));

    const burnForecast = forecastMetrics
      .filter(m => m.metric === 'BURN')
      .sort((a, b) => a.quarterIndex - b.quarterIndex)
      .map(m => ({ quarter: m.quarterIndex, value: m.value }));

    const tractionForecast = forecastMetrics
      .filter(m => m.metric === 'TRACTION')
      .sort((a, b) => a.quarterIndex - b.quarterIndex)
      .map(m => ({ quarter: m.quarterIndex, value: m.value }));

    const actuals = inv.founderUpdates.map(update => ({
      quarter: update.quarterIndex,
      submittedAt: update.submittedAt,
      revenue: update.actualRevenue,
      burn: update.actualBurn,
      traction: update.actualTraction,
      runwayMonths: update.actualRunwayMonths,
      narrativeGood: update.narrativeGood,
      narrativeBad: update.narrativeBad,
      narrativeHelp: update.narrativeHelp
    }));

    return {
      company: {
        id: inv.id,
        name: inv.companyName,
        sector: inv.sector,
        stage: inv.stage,
        investmentAmount: inv.committedCapitalLcl / inv.investmentFxRate,
        currency: inv.localCurrency,
        investmentType: inv.investmentType,
        investmentDate: inv.investmentExecutionDate,
        status: inv.status
      },
      founders: inv.founders.map(f => ({
        name: f.name,
        email: f.email
      })),
      forecast: {
        version: forecast?.version,
        startQuarter: forecast?.startQuarter,
        horizonQuarters: forecast?.horizonQuarters,
        revenue: revenueForecast,
        burn: burnForecast,
        traction: tractionForecast
      },
      actuals: actuals
    };
  });

  console.log(JSON.stringify(extractedData, null, 2));
}

extractData()
  .catch((e) => {
    console.error('Error extracting data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });