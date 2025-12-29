import { prisma } from './prisma';
import { FlagStatus, ActionType, ActionStatus } from '@prisma/client';

interface InvestmentStatus {
  hasNewFlags: boolean;
  hasMonitoringFlags: boolean;
  consecutiveAmberQuarters: number;
}

export async function checkActionRequired(investmentId: string): Promise<boolean> {
  const flags = await prisma.flag.findMany({
    where: {
      investmentId,
      status: {
        in: [FlagStatus.NEW, FlagStatus.MONITORING]
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const hasNewFlags = flags.some(f => f.status === FlagStatus.NEW);
  const hasMonitoringFlags = flags.some(f => f.status === FlagStatus.MONITORING);

  if (hasNewFlags) {
    return true;
  }

  if (hasMonitoringFlags) {
    const founderUpdates = await prisma.founderUpdate.findMany({
      where: { investmentId },
      orderBy: { quarterIndex: 'desc' },
      take: 4
    });

    let consecutiveAmber = 0;
    for (const update of founderUpdates) {
      const updateFlags = await prisma.flag.findMany({
        where: {
          founderUpdateId: update.id,
          status: FlagStatus.MONITORING
        }
      });

      if (updateFlags.length > 0) {
        consecutiveAmber++;
      } else {
        break;
      }
    }

    if (consecutiveAmber >= 2) {
      return true;
    }
  }

  return false;
}

export async function createActionRequired(
  investmentId: string,
  dealOwner: string
): Promise<void> {
  const existingAction = await prisma.actionRequired.findFirst({
    where: {
      investmentId,
      status: {
        in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS]
      }
    }
  });

  if (existingAction) {
    return;
  }

  await prisma.actionRequired.create({
    data: {
      investmentId,
      type: ActionType.MONITOR,
      actionOwner: dealOwner,
      reviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Action required due to investment status',
      status: ActionStatus.PENDING
    }
  });

  await prisma.auditLog.create({
    data: {
      investmentId,
      action: 'ACTION_REQUIRED_CREATED',
      changedBy: 'SYSTEM'
    }
  });
}

export async function checkAndTriggerActions(): Promise<void> {
  const investments = await prisma.investment.findMany({
    where: { status: 'ACTIVE' },
    include: {
      flags: {
        where: {
          status: {
            in: [FlagStatus.NEW, FlagStatus.MONITORING]
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  for (const investment of investments) {
    const actionRequired = await checkActionRequired(investment.id);

    if (actionRequired) {
      await createActionRequired(investment.id, investment.dealOwner);
    }
  }
}
