import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://rogue-portfolio-backend-production.up.railway.app';

type BackendInvestment = {
  id: string;
  icReference: string;
  icApprovalDate: string;
  investmentExecutionDate: string;
  dealOwner: string;
  companyName: string;
  sector: string;
  geography: string;
  stage: string;
  investmentType: string;
  committedCapitalLcl: number;
  deployedCapitalLcl: number;
  ownershipPercent: number | null;
  coInvestors: string | null;
  hasBoardSeat: boolean;
  hasProRataRights: boolean;
  hasAntiDilutionProtection: boolean;
  localCurrency: string;
  investmentFxRate: number;
  valuationFxRate: number;
  roundSizeEur: number | null;
  enterpriseValueEur: number | null;
  currentFairValueEur: number;
  raisedFollowOnCapital: boolean;
  clearProductMarketFit: boolean;
  meaningfulRevenue: boolean;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'EXITED' | 'WRITTEN_OFF';
  founders: Array<{ id: string; name: string; email: string }>;
  forecasts?: Array<{
    metrics: Array<{ metric: string; quarterIndex: number; value: number }>;
    startQuarter: string;
  }>;
  founderUpdates?: Array<{
    id: string;
    quarterIndex: number;
    submittedAt: string;
    actualRevenue: number;
    actualBurn: number;
    actualTraction: number;
    actualRunwayMonths: number;
    narrativeGood: string | null;
    narrativeBad: string | null;
    narrativeHelp: string | null;
  }>;
  flags?: Array<{
    id: string;
    type: string;
    metric: string | null;
    threshold: string;
    actualValue: number | null;
    forecastValue: number | null;
    deltaPct: number | null;
    status: string;
    createdAt: string;
  }>;
};

const buildForecastSeries = (
  metrics: Array<{ metric: string; quarterIndex: number; value: number }>,
  metricType: string
) => {
  return metrics
    .filter((metric) => metric.metric === metricType)
    .map(({ quarterIndex, value }) => ({ quarterIndex, value }))
    .sort((a, b) => a.quarterIndex - b.quarterIndex);
};

const mapToDetailResponse = (investment: BackendInvestment) => {
  const forecasts = investment.forecasts || [];
  const latestForecast = forecasts[forecasts.length - 1];
  const forecastMetrics = latestForecast?.metrics || [];
  const updates = (investment.founderUpdates || []).sort(
    (a, b) => a.quarterIndex - b.quarterIndex
  );

  return {
    investment: {
      id: investment.id,
      icReference: investment.icReference,
      icApprovalDate: investment.icApprovalDate,
      investmentExecutionDate: investment.investmentExecutionDate,
      dealOwner: investment.dealOwner,
      companyName: investment.companyName,
      sector: investment.sector,
      geography: investment.geography,
      stage: investment.stage,
      investmentType: investment.investmentType,
      committedCapitalLcl: investment.committedCapitalLcl,
      deployedCapitalLcl: investment.deployedCapitalLcl,
      ownershipPercent: investment.ownershipPercent,
      coInvestors: investment.coInvestors,
      hasBoardSeat: investment.hasBoardSeat,
      hasProRataRights: investment.hasProRataRights,
      hasAntiDilutionProtection: investment.hasAntiDilutionProtection,
      localCurrency: investment.localCurrency,
      investmentFxRate: investment.investmentFxRate,
      valuationFxRate: investment.valuationFxRate,
      roundSizeEur: investment.roundSizeEur,
      enterpriseValueEur: investment.enterpriseValueEur,
      currentFairValueEur: investment.currentFairValueEur,
      raisedFollowOnCapital: investment.raisedFollowOnCapital,
      clearProductMarketFit: investment.clearProductMarketFit,
      meaningfulRevenue: investment.meaningfulRevenue,
      status: investment.status,
      founders: investment.founders.map((founder) => ({
        name: founder.name,
        email: founder.email
      }))
    },
    forecast: {
      revenue: buildForecastSeries(forecastMetrics, 'REVENUE'),
      burn: buildForecastSeries(forecastMetrics, 'BURN'),
      traction: buildForecastSeries(forecastMetrics, 'TRACTION')
    },
    actuals: {
      revenue: updates.map((update) => ({ quarter: update.quarterIndex, value: update.actualRevenue })),
      burn: updates.map((update) => ({ quarter: update.quarterIndex, value: update.actualBurn })),
      traction: updates.map((update) => ({ quarter: update.quarterIndex, value: update.actualTraction })),
      runway: updates.map((update) => ({ quarter: update.quarterIndex, value: update.actualRunwayMonths }))
    },
    updates: updates.map((update) => ({
      id: update.id,
      quarterIndex: update.quarterIndex,
      submittedAt: update.submittedAt,
      actualRevenue: update.actualRevenue,
      actualBurn: update.actualBurn,
      actualRunwayMonths: update.actualRunwayMonths,
      actualTraction: update.actualTraction,
      narrativeGood: update.narrativeGood,
      narrativeBad: update.narrativeBad,
      narrativeHelp: update.narrativeHelp
    })),
    flags: (investment.flags || []).map((flag) => ({
      id: flag.id,
      type: flag.type,
      metric: flag.metric,
      threshold: flag.threshold,
      actualValue: flag.actualValue,
      forecastValue: flag.forecastValue,
      deltaPct: flag.deltaPct,
      status: flag.status,
      createdAt: flag.createdAt
    }))
  };
};

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
    const investment = await response.json() as BackendInvestment;
    return NextResponse.json(mapToDetailResponse(investment));
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
