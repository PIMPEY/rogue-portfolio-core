import { prisma } from '../../../lib/prisma';

export async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { investmentId } = req.body;

    if (!investmentId) {
      return res.status(400).json({ error: 'Missing investmentId' });
    }

    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: { documents: true },
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (investment.documents.length === 0) {
      return res.status(400).json({ error: 'No documents uploaded' });
    }

    const docChecksums = investment.documents.map(d => d.checksum).sort().join(',');

    const existingJob = await prisma.reviewJob.findFirst({
      where: {
        investmentId,
        docChecksums,
        status: { in: ['QUEUED', 'RUNNING'] },
      },
    });

    if (existingJob) {
      return res.json({ job: existingJob });
    }

    const job = await prisma.reviewJob.create({
      data: {
        investmentId,
        status: 'QUEUED',
        progress: 0,
        docChecksums,
        reviewConfigVersion: '1.0',
      },
    });

    res.json({ job });
  } catch (error: any) {
    console.error('Error starting review:', error);
    res.status(500).json({ error: 'Failed to start review' });
  }
}
