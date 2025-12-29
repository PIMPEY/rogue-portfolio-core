import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActionStatus, AuditAction } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params as { id: string };
    const body = await request.json();
    const {
      type,
      actionOwner,
      reviewDate,
      notes,
      status,
      exitType,
      indicativeValuationMin,
      indicativeValuationMax,
      knownAcquirers,
      clearedBy,
      clearRationale
    } = body;

    const existingAction = await prisma.actionRequired.findUnique({
      where: { id }
    });

    if (!existingAction) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (actionOwner !== undefined) updateData.actionOwner = actionOwner;
    if (reviewDate !== undefined) updateData.reviewDate = new Date(reviewDate);
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    if (exitType !== undefined) updateData.exitType = exitType;
    if (indicativeValuationMin !== undefined) updateData.indicativeValuationMin = indicativeValuationMin;
    if (indicativeValuationMax !== undefined) updateData.indicativeValuationMax = indicativeValuationMax;
    if (knownAcquirers !== undefined) updateData.knownAcquirers = knownAcquirers;

    if (status === ActionStatus.CLEARED) {
      updateData.clearedAt = new Date();
      updateData.clearedBy = clearedBy;
      updateData.clearRationale = clearRationale;
    }

    const action = await prisma.actionRequired.update({
      where: { id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        investmentId: existingAction.investmentId,
        actionRequiredId: id,
        action: status === ActionStatus.CLEARED ? 'ACTION_REQUIRED_CLEARED' : 'ACTION_REQUIRED_UPDATED',
        fieldName: 'status',
        oldValue: existingAction.status,
        newValue: status,
        rationale: clearRationale,
        changedBy: clearedBy || actionOwner
      }
    });

    return NextResponse.json(action);
  } catch (error) {
    console.error('Error updating action:', error);
    return NextResponse.json({ error: 'Failed to update action' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params as { id: string };

    const action = await prisma.actionRequired.findUnique({
      where: { id }
    });

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    await prisma.actionRequired.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting action:', error);
    return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 });
  }
}
