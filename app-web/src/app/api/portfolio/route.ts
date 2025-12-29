import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FlagStatus } from '@prisma/client';
import { calculateXIRR, formatXIRR, calculateMOIC, formatMOIC } from '@/lib/xirr';

export async function GET() {
  try {
    const investments = await prisma.investment.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        flags: {
          where: {
            status: {
              in: [FlagStatus.NEW, FlagStatus.MONITORING]
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        founderUpdates: {
          orderBy: {
            quarterIndex: 'desc'
          },
          take: 1
        },
        founders: true,
        cashflows: {
          orderBy: { date: 'asc' }
        },
        _count: {
          select: {
            flags: true,
            founderUpdates: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const portfolio = investments.map(inv => {
      const hasNewFlags = inv.flags.some(f => f.status === FlagStatus.NEW);
      const hasMonitoringFlags = inv.flags.some(f => f.status === FlagStatus.MONITORING);
      
      let status = 'GREEN';
      if (hasNewFlags) {
        status = 'RED';
      } else if (hasMonitoringFlags) {
        status = 'AMBER';
      }

      const latestUpdate = inv.founderUpdates[0];
      const runway = latestUpdate?.actualRunwayMonths || null;

      const committedCapitalEur = inv.committedCapitalLcl / inv.investmentFxRate;
      const deployedCapitalEur = inv.deployedCapitalLcl / inv.investmentFxRate;

      const cashflows = inv.cashflows.map(cf => ({
        amount: cf.amountEur,
        date: new Date(cf.date)
      }));

      const totalInvestedEur = cashflows
        .filter(cf => cf.amount < 0)
        .reduce((sum, cf) => sum + Math.abs(cf.amount), 0);

      const xirr = calculateXIRR(cashflows);
      const moic = calculateMOIC(totalInvestedEur, inv.currentFairValueEur);

      return {
        id: inv.id,
        companyName: inv.companyName,
        sector: inv.sector,
        stage: inv.stage,
        geography: inv.geography,
        investmentType: inv.investmentType,
        committedCapitalEur,
        deployedCapitalEur,
        ownershipPercent: inv.ownershipPercent,
        investmentDate: inv.investmentExecutionDate,
        currentFairValueEur: inv.currentFairValueEur,
        grossMoic: formatMOIC(moic),
        grossIrr: formatXIRR(xirr),
        roundSizeEur: inv.roundSizeEur,
        enterpriseValueEur: inv.enterpriseValueEur,
        runway,
        status,
        activeFlags: inv.flags.length,
        founders: inv.founders.map(f => ({
          name: f.name,
          email: f.email
        })),
        raisedFollowOnCapital: inv.raisedFollowOnCapital,
        clearProductMarketFit: inv.clearProductMarketFit,
        meaningfulRevenue: inv.meaningfulRevenue,
        totalUpdates: inv._count.founderUpdates,
        latestUpdateQuarter: latestUpdate?.quarterIndex || 0
      };
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
