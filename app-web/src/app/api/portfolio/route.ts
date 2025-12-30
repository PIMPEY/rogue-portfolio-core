import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://rogue-portfolio-backend-production.up.railway.app';

type BackendFlag = {
  type?: string;
  status?: string;
};

type BackendInvestment = {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  geography: string;
  investmentType: string;
  committedCapitalLcl?: number | null;
  deployedCapitalLcl?: number | null;
  ownershipPercent?: number | null;
  investmentExecutionDate?: string | null;
  currentFairValueEur?: number | null;
  roundSizeEur?: number | null;
  enterpriseValueEur?: number | null;
  valuationFxRate?: number | null;
  investmentFxRate?: number | null;
  raisedFollowOnCapital?: boolean;
  clearProductMarketFit?: boolean;
  meaningfulRevenue?: boolean;
  flags?: BackendFlag[];
  founders?: Array<{ name: string; email: string }>;
};

type PortfolioInvestment = {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  geography: string;
  investmentType: string;
  committedCapitalEur: number | null;
  deployedCapitalEur: number | null;
  ownershipPercent: number | null;
  investmentDate: string;
  currentFairValueEur: number | null;
  grossMoic: string;
  grossIrr: string;
  roundSizeEur: number | null;
  enterpriseValueEur: number | null;
  runway: number | null;
  status: 'GREEN' | 'AMBER' | 'RED';
  activeFlags: number;
  founders: Array<{ name: string; email: string }>;
  raisedFollowOnCapital: boolean;
  clearProductMarketFit: boolean;
  meaningfulRevenue: boolean;
  totalUpdates: number;
  latestUpdateQuarter: number | null;
};

const deriveStatus = (flags: BackendFlag[] = []): PortfolioInvestment['status'] => {
  const hasCritical = flags.some(flag => flag.type?.includes('CRITICAL'));
  const hasActive = flags.some(flag => flag.status !== 'RESOLVED');

  if (hasCritical) return 'RED';
  if (hasActive) return 'AMBER';
  return 'GREEN';
};

const normalizeInvestment = (investment: BackendInvestment): PortfolioInvestment => {
  const fxRate = investment.valuationFxRate || investment.investmentFxRate || 1;
  const committedCapitalEur = investment.committedCapitalLcl != null
    ? investment.committedCapitalLcl * fxRate
    : null;
  const deployedCapitalEur = investment.deployedCapitalLcl != null
    ? investment.deployedCapitalLcl * fxRate
    : null;

  const grossMoic = committedCapitalEur && investment.currentFairValueEur
    ? (investment.currentFairValueEur / committedCapitalEur).toFixed(2)
    : 'N/A';

  return {
    id: investment.id,
    companyName: investment.companyName,
    sector: investment.sector,
    stage: investment.stage,
    geography: investment.geography,
    investmentType: investment.investmentType,
    committedCapitalEur,
    deployedCapitalEur,
    ownershipPercent: investment.ownershipPercent ?? null,
    investmentDate: investment.investmentExecutionDate || new Date().toISOString(),
    currentFairValueEur: investment.currentFairValueEur ?? null,
    grossMoic,
    grossIrr: 'N/A',
    roundSizeEur: investment.roundSizeEur ?? null,
    enterpriseValueEur: investment.enterpriseValueEur ?? null,
    runway: null,
    status: deriveStatus(investment.flags),
    activeFlags: (investment.flags || []).filter(flag => flag.status !== 'RESOLVED').length,
    founders: investment.founders || [],
    raisedFollowOnCapital: investment.raisedFollowOnCapital ?? false,
    clearProductMarketFit: investment.clearProductMarketFit ?? false,
    meaningfulRevenue: investment.meaningfulRevenue ?? false,
    totalUpdates: 0,
    latestUpdateQuarter: null
  };
};

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/portfolio`);
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    const portfolio = await response.json();
    const normalized = Array.isArray(portfolio)
      ? portfolio.map(normalizeInvestment)
      : [];
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
