import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActionStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const investmentId = searchParams.get('investmentId');
    const status = searchParams.get('status');

    const where: any = {};
    if (investmentId) {
      where.investmentId = investmentId;
    }
    if (status) {
      where.status = status;
    }

    const actions = await prisma.actionRequired.findMany({
      where,
      include: {
        investment: {
          select: {
            companyName: true,
            sector: true,
            stage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error fetching actions:', error);
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      investmentId,
      type,
      actionOwner,
      reviewDate,
      notes,
      exitType,
      indicativeValuationMin,
      indicativeValuationMax,
      knownAcquirers
    } = body;

    const action = await prisma.actionRequired.create({
      data: {
        investmentId,
        type,
        actionOwner,
        reviewDate: new Date(reviewDate),
        notes,
        exitType,
        indicativeValuationMin,
        indicativeValuationMax,
        knownAcquirers,
        status: ActionStatus.PENDING
      }
    });

    await prisma.auditLog.create({
      data: {
        investmentId,
        actionRequiredId: action.id,
        action: 'ACTION_REQUIRED_CREATED',
        fieldName: 'type',
        newValue: type,
        changedBy: actionOwner
      }
    });

    return NextResponse.json(action);
  } catch (error) {
    console.error('Error creating action:', error);
    return NextResponse.json({ error: 'Failed to create action' }, { status: 500 });
  }
}
