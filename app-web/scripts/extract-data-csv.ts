import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function extractData() {
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

  let csv = 'Company Name,Sector,Stage,Investment Amount,Investment Type,Investment Date,Founder Name,Founder Email,Quarter,Type,Revenue,Burn,Traction,Runway Months,Narrative Good,Narrative Bad,Narrative Help\n';

  investments.forEach(inv => {
    const forecast = inv.forecasts[0];
    const forecastMetrics = forecast?.metrics || [];

    const revenueForecast = forecastMetrics
      .filter(m => m.metric === 'REVENUE')
      .sort((a, b) => a.quarterIndex - b.quarterIndex);

    const burnForecast = forecastMetrics
      .filter(m => m.metric === 'BURN')
      .sort((a, b) => a.quarterIndex - b.quarterIndex);

    const tractionForecast = forecastMetrics
      .filter(m => m.metric === 'TRACTION')
      .sort((a, b) => a.quarterIndex - b.quarterIndex);

    const founder = inv.founders[0];

    for (let q = 1; q <= 8; q++) {
      const rev = revenueForecast.find(m => m.quarterIndex === q)?.value || 0;
      const bur = burnForecast.find(m => m.quarterIndex === q)?.value || 0;
      const tra = tractionForecast.find(m => m.quarterIndex === q)?.value || 0;

      csv += `"${inv.companyName}","${inv.sector}","${inv.stage}",${inv.committedCapitalLcl / inv.investmentFxRate},"${inv.investmentType}","${inv.investmentExecutionDate.toISOString().split('T')[0]}","${founder?.name || ''}","${founder?.email || ''}",${q},"FORECAST",${rev},${bur},${tra},,,\n`;
    }

    inv.founderUpdates.forEach(update => {
      csv += `"${inv.companyName}","${inv.sector}","${inv.stage}",${inv.committedCapitalLcl / inv.investmentFxRate},"${inv.investmentType}","${inv.investmentExecutionDate.toISOString().split('T')[0]}","${founder?.name || ''}","${founder?.email || ''}",${update.quarterIndex},"ACTUAL",${update.actualRevenue},${update.actualBurn},${update.actualTraction},${update.actualRunwayMonths},"${update.narrativeGood || ''}","${update.narrativeBad || ''}","${update.narrativeHelp || ''}"\n`;
    });
  });

  fs.writeFileSync('extracted-data.csv', csv);
  console.log('Data extracted to extracted-data.csv');
}

extractData()
  .catch((e) => {
    console.error('Error extracting data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });