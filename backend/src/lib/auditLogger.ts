import { prisma } from './prisma';
import { AuditAction } from '@prisma/client';

export interface AuditLogData {
  investmentId: string;
  action: AuditAction;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  rationale?: string;
  changedBy: string;
  actionRequiredId?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        investmentId: data.investmentId,
        action: data.action,
        fieldName: data.fieldName,
        oldValue: data.oldValue,
        newValue: data.newValue,
        rationale: data.rationale,
        changedBy: data.changedBy,
        actionRequiredId: data.actionRequiredId,
      },
    });
    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    throw error;
  }
}

export async function logInvestmentUpdate(
  investmentId: string,
  changes: Record<string, { old: any; new: any }>,
  rationale: string,
  changedBy: string
) {
  const auditLogs = [];

  for (const [fieldName, change] of Object.entries(changes)) {
    const auditLog = await createAuditLog({
      investmentId,
      action: 'INVESTMENT_UPDATED',
      fieldName,
      oldValue: JSON.stringify(change.old),
      newValue: JSON.stringify(change.new),
      rationale,
      changedBy,
    });
    auditLogs.push(auditLog);
  }

  return auditLogs;
}

export async function logValuationUpdate(
  investmentId: string,
  oldValuation: number,
  newValuation: number,
  rationale: string,
  changedBy: string
) {
  return createAuditLog({
    investmentId,
    action: 'VALUATION_UPDATE',
    fieldName: 'fairValueEur',
    oldValue: oldValuation.toString(),
    newValue: newValuation.toString(),
    rationale,
    changedBy,
  });
}

export async function logActionRequiredUpdate(
  investmentId: string,
  actionId: string,
  changes: Record<string, { old: any; new: any }>,
  rationale: string,
  changedBy: string
) {
  const auditLogs = [];

  for (const [fieldName, change] of Object.entries(changes)) {
    const auditLog = await createAuditLog({
      investmentId,
      actionRequiredId: actionId,
      action: 'ACTION_REQUIRED_UPDATED',
      fieldName,
      oldValue: JSON.stringify(change.old),
      newValue: JSON.stringify(change.new),
      rationale,
      changedBy,
    });
    auditLogs.push(auditLog);
  }

  return auditLogs;
}

export async function logActionRequiredCleared(
  investmentId: string,
  actionId: string,
  rationale: string,
  changedBy: string
) {
  return createAuditLog({
    investmentId,
    actionRequiredId: actionId,
    action: 'ACTION_REQUIRED_CLEARED',
    rationale,
    changedBy,
  });
}
