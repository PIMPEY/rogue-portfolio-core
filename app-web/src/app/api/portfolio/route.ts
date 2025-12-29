import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FlagStatus } from '@prisma/client';

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

      return {
        id: inv.id,
        companyName: inv.companyName,
        sector: inv.sector,
        stage: inv.stage,
        investmentAmount: inv.investmentAmount,
        investmentDate: inv.investmentDate,
        status,
        runway,
        activeFlags: inv.flags.length,
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
