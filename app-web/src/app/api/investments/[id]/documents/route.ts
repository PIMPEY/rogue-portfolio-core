import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DocumentType, DocumentVersionType, AuditAction } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 3 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const type = formData.get('type') as DocumentType;
    const versionType = formData.get('versionType') as DocumentVersionType;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 3MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `${id}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadsDir, fileName);
    
    await writeFile(filePath, buffer);

    if (versionType === DocumentVersionType.REVISION) {
      await prisma.document.updateMany({
        where: {
          investmentId: id,
          type,
          isCurrent: true
        },
        data: {
          isCurrent: false
        }
      });
    }

    const document = await prisma.document.create({
      data: {
        investmentId: id,
        type,
        versionType,
        filePath: `/uploads/documents/${fileName}`,
        fileName: file.name,
        fileSize: file.size,
        uploadedBy,
        isCurrent: true
      }
    });

    await prisma.auditLog.create({
      data: {
        investmentId: id,
        action: 'DOCUMENT_UPLOADED',
        fieldName: 'document',
        newValue: `${type} - ${versionType}`,
        changedBy: uploadedBy
      }
    });

    if (versionType === DocumentVersionType.REVISION && type === DocumentType.BUSINESS_PLAN) {
      await prisma.flag.create({
        data: {
          investmentId: id,
          type: 'LATE_UPDATE',
          threshold: 'Revised business plan uploaded - status review required',
          status: 'NEW'
        }
      });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documents = await prisma.document.findMany({
      where: { investmentId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
