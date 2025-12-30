import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { processReviewJob } from './lib/agent';

dotenv.config();

const POLL_INTERVAL = 5000; // 5 seconds

async function worker() {
  console.log('Agent worker started...');

  while (true) {
    try {
      const job = await prisma.reviewJob.findFirst({
        where: {
          status: 'QUEUED',
          retryCount: { lt: 3 },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (job) {
        console.log(`Processing job ${job.id} for investment ${job.investmentId}`);
        await processReviewJob(job.id);
      } else {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    } catch (error: any) {
      console.error('Worker error:', error);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  }
}

worker().catch(console.error);
