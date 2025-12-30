import { NextResponse } from 'express';
import { generatePresignedUploadUrl, generateDocumentKey } from '../../../lib/storage';
import { prisma } from '../../../lib/prisma';

export async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { investmentId, fileName, contentType } = req.body;

    if (!investmentId || !fileName || !contentType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const key = generateDocumentKey(investmentId, fileName);
    const { url } = await generatePresignedUploadUrl(key, contentType);

    res.json({ url, key });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}
