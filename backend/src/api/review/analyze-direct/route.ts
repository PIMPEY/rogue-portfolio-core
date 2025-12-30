import { prisma } from '../../../lib/prisma';
import { analyzeDocumentsDirect } from '../../../lib/openai';

export async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { investmentId, documents, investment } = req.body;

    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: 'No documents to analyze' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      });
    }

    const analysis = await analyzeDocumentsDirect(documents, investment);

    if (investmentId) {
      await prisma.reviewJob.create({
        data: {
          investmentId,
          status: 'SUCCEEDED',
          progress: 100,
          docChecksums: documents.map((d: any) => d.fileName).sort().join(','),
          reviewConfigVersion: '1.0',
          summaryJson: analysis,
          createdAt: new Date(),
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      });
    }

    res.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Error analyzing documents:', error);
    res.status(500).json({ error: 'Failed to analyze documents', details: error.message });
  }
}
