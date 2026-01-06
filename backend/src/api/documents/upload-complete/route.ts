import { prisma } from '../../../lib/prisma';
import { calculateChecksum } from '../../../lib/crypto';

export async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { investmentId, documents } = req.body;

    if (!investmentId || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const createdDocuments = await Promise.all(
      documents.map(async (doc: any) => {
        return prisma.document.create({
          data: {
            investmentId,
            type: doc.category,
            versionType: 'INITIAL',
            filePath: doc.key,
            storageUrl: doc.key,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            contentType: doc.contentType,
            checksum: doc.checksum,
            status: 'uploaded',
            uploadedBy: req.user?.name || 'Unknown',
            isCurrent: true,
          },
        });
      })
    );

    res.json({ documents: createdDocuments });
  } catch (error: any) {
    console.error('Error completing upload:', error);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
}
