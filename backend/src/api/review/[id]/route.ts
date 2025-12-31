import { prisma } from '../../../lib/prisma';

export async function handler(req: any, res: any) {
  const { id } = req.params;

  if (req.method === 'GET') {
    try {
      const job = await prisma.reviewJob.findUnique({
        where: { id },
        include: { investment: true },
      });

      if (!job) {
        return res.status(404).json({ error: 'Review job not found' });
      }

      res.json({ job });
    } catch (error: any) {
      console.error('Error fetching review job:', error);
      res.status(500).json({ error: 'Failed to fetch review job' });
    }
  } else if (req.method === 'POST') {
    try {
      const job = await prisma.reviewJob.findUnique({
        where: { id },
      });

      if (!job) {
        return res.status(404).json({ error: 'Review job not found' });
      }

      if (job.status !== 'FAILED') {
        return res.status(400).json({ error: 'Can only retry failed jobs' });
      }

      const updatedJob = await prisma.reviewJob.update({
        where: { id },
        data: {
          status: 'QUEUED',
          progress: 0,
          errorMessage: null,
          retryCount: job.retryCount + 1,
        },
      });

      res.json({ job: updatedJob });
    } catch (error: any) {
      console.error('Error retrying review job:', error);
      res.status(500).json({ error: 'Failed to retry review job' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
