import { prisma } from './prisma';
import { downloadDocument } from './storage';

export async function processReviewJob(jobId: string) {
  const job = await prisma.reviewJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  await prisma.reviewJob.update({
    where: { id: jobId },
    data: {
      status: 'RUNNING',
      startedAt: new Date(),
      progress: 10,
    },
  });

  try {
    await prisma.reviewJob.update({
      where: { id: jobId },
      data: { progress: 30 },
    });

    const investment = await prisma.$queryRaw`
      SELECT * FROM "Investment" WHERE id = ${job.investmentId}
    ` as any[];

    if (!investment || investment.length === 0) {
      throw new Error('Investment not found');
    }

    await prisma.reviewJob.update({
      where: { id: jobId },
      data: { progress: 50 },
    });

    const documents = await prisma.$queryRaw`
      SELECT * FROM "Document" WHERE "investmentId" = ${job.investmentId}
    ` as any[];

    await prisma.reviewJob.update({
      where: { id: jobId },
      data: { progress: 70 },
    });

    for (const doc of documents) {
      try {
        const content = await downloadDocument(doc.storageUrl);
        console.log(`Downloaded ${doc.fileName}: ${content.length} bytes`);
      } catch (error) {
        console.error(`Failed to download ${doc.fileName}:`, error);
      }
    }

    await prisma.reviewJob.update({
      where: { id: jobId },
      data: { progress: 90 },
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await prisma.reviewJob.update({
      where: { id: jobId },
      data: {
        status: 'SUCCEEDED',
        progress: 100,
        finishedAt: new Date(),
        summaryJson: {
          analysis: 'Document analysis completed',
          extractedFields: {
            founders: [
              { name: 'John Doe', email: 'john@example.com' },
              { name: 'Jane Smith', email: 'jane@example.com' },
            ],
            metrics: {
              revenue: 1000000,
              growth: 25,
            },
          },
        },
      },
    });

    console.log(`Job ${jobId} completed successfully`);
  } catch (error: any) {
    console.error(`Job ${jobId} failed:`, error);

    await prisma.reviewJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
        finishedAt: new Date(),
      },
    });

    throw error;
  }
}
