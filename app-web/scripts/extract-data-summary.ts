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

  let markdown = '# Project Rogue - Extracted Data\n\n';
  markdown += '## Companies and Founders\n\n';

  investments.forEach(inv => {
    markdown += `### ${inv.companyName}\n\n`;
    markdown += `- **Sector:** ${inv.sector}\n`;
    markdown += `- **Stage:** ${inv.stage}\n`;
    markdown += `- **Investment:** $${(inv.committedCapitalLcl / inv.investmentFxRate).toLocaleString('en-US', {maximumFractionDigits: 0})}\n`;
    markdown += `- **Type:** ${inv.investmentType}\n`;
    markdown += `- **Date:** ${inv.investmentExecutionDate.toISOString().split('T')[0]}\n`;
    markdown += `- **Status:** ${inv.status}\n\n`;

    markdown += `**Founders:**\n`;
    inv.founders.forEach(f => {
      markdown += `- ${f.name} (${f.email})\n`;
    });
    markdown += '\n';

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

    markdown += `**Forecast (Base Case):**\n\n`;
    markdown += `| Quarter | Revenue | Burn | Traction |\n`;
    markdown += `|---------|---------|------|----------|\n`;

    for (let q = 1; q <= 8; q++) {
      const rev = revenueForecast.find(m => m.quarterIndex === q)?.value || 0;
      const bur = burnForecast.find(m => m.quarterIndex === q)?.value || 0;
      const tra = tractionForecast.find(m => m.quarterIndex === q)?.value || 0;

      markdown += `| Q${q} | $${rev.toLocaleString('en-US', {maximumFractionDigits: 0})} | $${bur.toLocaleString('en-US', {maximumFractionDigits: 0})} | ${tra.toFixed(0)} |\n`;
    }
    markdown += '\n';

    if (inv.founderUpdates.length > 0) {
      markdown += `**Actuals:**\n\n`;
      markdown += `| Quarter | Revenue | Burn | Traction | Runway | Good | Bad | Help |\n`;
      markdown += `|---------|---------|------|----------|--------|------|-----|------|\n`;

      inv.founderUpdates.forEach(update => {
        markdown += `| Q${update.quarterIndex} | $${update.actualRevenue.toLocaleString('en-US', {maximumFractionDigits: 0})} | $${update.actualBurn.toLocaleString('en-US', {maximumFractionDigits: 0})} | ${update.actualTraction.toFixed(0)} | ${update.actualRunwayMonths.toFixed(1)}mo | ${update.narrativeGood || '-'} | ${update.narrativeBad || '-'} | ${update.narrativeHelp || '-'} |\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
  });

  fs.writeFileSync('extracted-data.md', markdown);
  console.log('Data extracted to extracted-data.md');
}

extractData()
  .catch((e) => {
    console.error('Error extracting data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });