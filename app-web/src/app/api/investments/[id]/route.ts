import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params as { id: string };
    const response = await fetch(`${BACKEND_URL}/api/investments/${id}`);
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    const data = await response.json();

    // Transform backend response to match frontend expectations
    const transformed = {
      investment: {
        id: data.id,
        icReference: data.icReference || '',
        icApprovalDate: data.icApprovalDate || new Date().toISOString(),
        investmentExecutionDate: data.investmentDate || new Date().toISOString(),
        dealOwner: data.dealOwner || 'Unknown',
        companyName: data.companyName,
        sector: data.sector,
        geography: data.geography,
        stage: data.stage,
        investmentType: data.investmentType || 'EQUITY',
        committedCapitalLcl: data.committedCapitalLcl || 0,
        deployedCapitalLcl: data.deployedCapitalLcl || 0,
        ownershipPercent: data.ownershipPercent,
        coInvestors: null,
        hasBoardSeat: false,
        hasProRataRights: false,
        hasAntiDilutionProtection: false,
        localCurrency: 'EUR',
        investmentFxRate: 1.0,
        valuationFxRate: 1.0,
        roundSizeEur: data.roundSizeEur,
        enterpriseValueEur: data.enterpriseValueEur,
        currentFairValueEur: data.currentFairValueEur,
        raisedFollowOnCapital: data.raisedFollowOnCapital || false,
        clearProductMarketFit: data.clearProductMarketFit || false,
        meaningfulRevenue: data.meaningfulRevenue || false,
        status: data.status || 'ACTIVE',
        founders: data.founders || []
      },
      forecast: {
        revenue: [],
        burn: [],
        traction: []
      },
      actuals: {
        revenue: [],
        burn: [],
        traction: [],
        runway: []
      },
      updates: [],
      flags: []
    };

    // Parse forecasts if available
    if (data.forecasts && data.forecasts.length > 0) {
      const latestForecast = data.forecasts[0];
      if (latestForecast.metrics) {
        transformed.forecast.revenue = latestForecast.metrics
          .filter((m: any) => m.metric === 'REVENUE')
          .map((m: any) => ({ quarterIndex: m.quarterIndex, value: m.value }));
        transformed.forecast.burn = latestForecast.metrics
          .filter((m: any) => m.metric === 'BURN')
          .map((m: any) => ({ quarterIndex: m.quarterIndex, value: m.value }));
        transformed.forecast.traction = latestForecast.metrics
          .filter((m: any) => m.metric === 'TRACTION')
          .map((m: any) => ({ quarterIndex: m.quarterIndex, value: m.value }));
      }
    }

    // Parse founder updates (actuals)
    if (data.founderUpdates && data.founderUpdates.length > 0) {
      transformed.updates = data.founderUpdates.map((u: any) => ({
        id: u.id,
        quarterIndex: u.quarterIndex,
        submittedAt: u.submittedAt,
        actualRevenue: u.actualRevenue || 0,
        actualBurn: u.actualBurn || 0,
        actualRunwayMonths: u.actualRunwayMonths || 0,
        actualTraction: u.actualTraction || 0,
        narrativeGood: u.narrativeGood,
        narrativeBad: u.narrativeBad,
        narrativeHelp: u.narrativeHelp
      }));

      // Convert to actuals format
      transformed.actuals.revenue = data.founderUpdates.map((u: any) => ({
        quarter: u.quarterIndex,
        value: u.actualRevenue || 0
      }));
      transformed.actuals.burn = data.founderUpdates.map((u: any) => ({
        quarter: u.quarterIndex,
        value: u.actualBurn || 0
      }));
      transformed.actuals.traction = data.founderUpdates.map((u: any) => ({
        quarter: u.quarterIndex,
        value: u.actualTraction || 0
      }));
      transformed.actuals.runway = data.founderUpdates.map((u: any) => ({
        quarter: u.quarterIndex,
        value: u.actualRunwayMonths || 0
      }));
    }

    // Parse flags
    if (data.flags && data.flags.length > 0) {
      transformed.flags = data.flags.map((f: any) => ({
        id: f.id,
        type: f.type,
        metric: f.metric,
        threshold: f.threshold,
        actualValue: f.actualValue,
        forecastValue: f.forecastValue,
        deltaPct: f.deltaPct,
        status: f.status,
        createdAt: f.createdAt
      }));
    }

    return NextResponse.json(transformed);
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
    const response = await fetch(`${BACKEND_URL}/api/investments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    const investment = await response.json();
    return NextResponse.json(investment);
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json({ error: 'Failed to update investment' }, { status: 500 });
  }
}
