const { getRunStats } = require('./agent-pipeline');

async function main() {
  const stats = await getRunStats();
  
  console.log('\n' + '='.repeat(70));
  console.log('FACTS v1 - RUN STATS');
  console.log('='.repeat(70));
  console.log(`Version: v1.0-frozen`);
  console.log(`Total Runs: ${stats.totalRuns}`);
  console.log(`Runs Until Review: ${stats.runsUntilReview}`);
  console.log(`Minimum Runs for Review: 10`);
  console.log(`Target Runs for Review: 15`);
  
  if (stats.runsUntilReview > 0) {
    console.log(`\n⏳ Status: Collecting data`);
    console.log(`   Run ${stats.runsUntilReview} more extractions before review`);
  } else {
    console.log(`\n✓ Status: Ready for review`);
    console.log(`   Run 'node analyze-extractions.js' to analyze results`);
  }
  
  console.log('='.repeat(70) + '\n');
}

main();
