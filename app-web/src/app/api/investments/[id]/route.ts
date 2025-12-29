import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvestmentStage, AuditAction } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params as { id: string };
    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        founders: true,
        cashflows: {
          orderBy: { date: 'asc' }
        },
        valuations: {
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' }
        },
        flags: {
          orderBy: { createdAt: 'desc' }
        },
        founderUpdates: {
          orderBy: { quarterIndex: 'asc' }
        }
      }
    });

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    const hasNewFlags = investment.flags.some(f => f.status === 'NEW');
    const hasMonitoringFlags = investment.flags.some(f => f.status === 'MONITORING');
    
    let status = 'GREEN';
    if (hasNewFlags) {
      status = 'RED';
    } else if (hasMonitoringFlags) {
      status = 'AMBER';
    }

    const investmentWithStatus = {
      ...investment,
      status
    };

    return NextResponse.json({ 
      investment: investmentWithStatus,
      forecast: {
        revenue: [],
        burn: [],
        traction: []
      },
      actuals: {
        revenue: investment.founderUpdates.map(u => ({ quarter: u.quarterIndex, value: u.actualRevenue })),
        burn: investment.founderUpdates.map(u => ({ quarter: u.quarterIndex, value: u.actualBurn })),
        traction: investment.founderUpdates.map(u => ({ quarter: u.quarterIndex, value: u.actualTraction })),
        runway: investment.founderUpdates.map(u => ({ quarter: u.quarterIndex, value: u.actualRunwayMonths }))
      },
      updates: investment.founderUpdates,
      flags: investment.flags
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json({ error: 'Failed to fetch investment' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingInvestment = await prisma.investment.findUnique({
      where: { id },
      select: { currentFairValueEur: true }
    });

    if (!existingInvestment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    const {
      icApprovalDate,
      investmentExecutionDate,
      dealOwner,
      companyName,
      sector,
      geography,
      stage,
      investmentType,
      committedCapitalLcl,
      deployedCapitalLcl,
      ownershipPercent,
      coInvestors,
      hasBoardSeat,
      hasProRataRights,
      hasAntiDilutionProtection,
      localCurrency,
      investmentFxRate,
      investmentFxSource,
      valuationFxRate,
      valuationFxSource,
      roundSizeEur,
      enterpriseValueEur,
      currentFairValueEur,
      raisedFollowOnCapital,
      clearProductMarketFit,
      meaningfulRevenue
    } = body;

    const valuationChanged = existingInvestment.currentFairValueEur !== currentFairValueEur;

    const investment = await prisma.investment.update({
      where: { id },
      data: {
        icApprovalDate: new Date(icApprovalDate),
        investmentExecutionDate: new Date(investmentExecutionDate),
        dealOwner,
        companyName,
        sector,
        geography,
        stage: stage as InvestmentStage,
        investmentType,
        committedCapitalLcl,
        deployedCapitalLcl,
        ownershipPercent,
        coInvestors,
        hasBoardSeat,
        hasProRataRights,
        hasAntiDilutionProtection,
        localCurrency,
        investmentFxRate,
        investmentFxSource,
        valuationFxRate,
        valuationFxSource,
        roundSizeEur,
        enterpriseValueEur,
        currentFairValueEur,
        raisedFollowOnCapital,
        clearProductMarketFit,
        meaningfulRevenue,
        auditLogs: {
          create: {
            action: 'INVESTMENT_UPDATED',
            changedBy: dealOwner
          }
        }
      }
    });

    if (valuationChanged) {
      await prisma.valuation.create({
        data: {
          investmentId: id,
          fairValueEur: currentFairValueEur,
          valuationDate: new Date(),
          rationale: 'Manual valuation update',
          changedBy: dealOwner
        }
      });

      await prisma.auditLog.create({
        data: {
          investmentId: id,
          action: 'VALUATION_UPDATE',
          fieldName: 'currentFairValueEur',
          oldValue: existingInvestment.currentFairValueEur.toString(),
          newValue: currentFairValueEur.toString(),
          changedBy: dealOwner
        }
      });
    }

    return NextResponse.json(investment);
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json({ error: 'Failed to update investment' }, { status: 500 });
  }
}
