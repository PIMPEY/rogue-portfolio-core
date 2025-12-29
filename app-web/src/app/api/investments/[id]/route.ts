import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MetricType } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        founders: true,
        forecasts: {
          include: {
            metrics: true
          },
          orderBy: { version: 'desc' },
          take: 1
        },
        founderUpdates: {
          orderBy: { quarterIndex: 'asc' }
        },
        flags: {
          orderBy: { createdAt: 'desc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    const forecast = investment.forecasts[0];
    const forecastMetrics = forecast?.metrics || [];

    const revenueForecast = forecastMetrics
      .filter(m => m.metric === MetricType.REVENUE)
      .sort((a, b) => a.quarterIndex - b.quarterIndex);
    
    const burnForecast = forecastMetrics
      .filter(m => m.metric === MetricType.BURN)
      .sort((a, b) => a.quarterIndex - b.quarterIndex);
    
    const tractionForecast = forecastMetrics
      .filter(m => m.metric === MetricType.TRACTION)
      .sort((a, b) => a.quarterIndex - b.quarterIndex);

    const revenueActual = investment.founderUpdates.map(u => ({
      quarter: u.quarterIndex,
      value: u.actualRevenue
    }));

    const burnActual = investment.founderUpdates.map(u => ({
      quarter: u.quarterIndex,
      value: u.actualBurn
    }));

    const tractionActual = investment.founderUpdates.map(u => ({
      quarter: u.quarterIndex,
      value: u.actualTraction
    }));

    const runwayActual = investment.founderUpdates.map(u => ({
      quarter: u.quarterIndex,
      value: u.actualRunwayMonths
    }));

    const hasNewFlags = investment.flags.some(f => f.status === 'NEW');
    const hasMonitoringFlags = investment.flags.some(f => f.status === 'MONITORING');
    
    let status = 'GREEN';
    if (hasNewFlags) {
      status = 'RED';
    } else if (hasMonitoringFlags) {
      status = 'AMBER';
    }

    return NextResponse.json({
      investment: {
        id: investment.id,
        companyName: investment.companyName,
        sector: investment.sector,
        stage: investment.stage,
        investmentAmount: investment.investmentAmount,
        investmentDate: investment.investmentDate,
        status,
        founders: investment.founders
      },
      forecast: {
        revenue: revenueForecast,
        burn: burnForecast,
        traction: tractionForecast
      },
      actuals: {
        revenue: revenueActual,
        burn: burnActual,
        traction: tractionActual,
        runway: runwayActual
      },
      updates: investment.founderUpdates,
      flags: investment.flags,
      notes: investment.notes
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json({ error: 'Failed to fetch investment' }, { status: 500 });
  }
}
