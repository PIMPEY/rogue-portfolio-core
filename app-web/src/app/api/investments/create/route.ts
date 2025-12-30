import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://rogue-portfolio-backend-production.up.railway.app';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const investmentData = JSON.parse(formData.get('investment') as string);
    const files = formData.getAll('files') as File[];
    
    const processedFiles = [];
    
    if (files.length > 0) {
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      const { existsSync } = await import('fs');
      
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const MAX_FILE_SIZE = 3 * 1024 * 1024;

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          continue;
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const fileName = `temp_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = join(uploadsDir, fileName);
        
        await writeFile(filePath, buffer);

        processedFiles.push({
          filePath: `/uploads/documents/${fileName}`,
          fileName: file.name,
          fileSize: file.size
        });
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/investments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        investment: investmentData,
        files: processedFiles
      }),
    });

    if (!response.ok) {
      throw new Error('Backend request failed');
    }

    const investment = await response.json();
    return NextResponse.json(investment);
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json({ error: 'Failed to create investment' }, { status: 500 });
  }
}
