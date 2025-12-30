import crypto from 'crypto';

export async function calculateChecksum(file: Buffer): Promise<string> {
  return crypto.createHash('sha256').update(file).digest('hex');
}

export function generateDocumentKey(investmentId: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `investments/${investmentId}/${timestamp}-${random}-${fileName}`;
}
