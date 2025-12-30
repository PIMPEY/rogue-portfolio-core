import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

function transformDummyData(data: any[]) {
  const investmentMap = new Map();
  
  data.forEach((item, index) => {
    const key = item.company.name;
    if (!investmentMap.has(key)) {
      investmentMap.set(key, {
        id: `inv-${index}`,
        companyName: item.company.name,
        sector: item.company.sector,
        stage: item.company.stage,
        geography: 'Europe',
        investmentType: item.company.investmentType,
        committedCapitalEur: item.company.investmentAmount * 0.92,
        deployedCapitalEur: item.company.investmentAmount * 0.85,
        ownershipPercent: 15.5,
        investmentDate: item.company.investmentDate.split('T')[0],
        currentFairValueEur: item.company.investmentAmount * 1.2,
        grossMoic: '1.2x',
        grossIrr: '18.5%',
        roundSizeEur: item.company.investmentAmount * 1.5,
        enterpriseValueEur: item.company.investmentAmount * 2.0,
        runway: item.actuals.length > 0 ? item.actuals[item.actuals.length - 1].runwayMonths : 12,
        status: item.actuals.length > 0 && item.actuals[item.actuals.length - 1].runwayMonths < 6 ? 'AMBER' : 'GREEN',
        activeFlags: item.actuals.length > 0 && item.actuals[item.actuals.length - 1].runwayMonths < 6 ? 1 : 0,
        founders: item.founders.map((f: any) => ({ name: f.name, email: f.email })),
        raisedFollowOnCapital: Math.random() > 0.5,
        clearProductMarketFit: Math.random() > 0.3,
        meaningfulRevenue: Math.random() > 0.4,
        totalUpdates: item.actuals.length,
        latestUpdateQuarter: item.actuals.length
      });
    }
  });
  
  return Array.from(investmentMap.values());
}

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/investments`);
    if (response.ok) {
      const investments = await response.json();
      if (Array.isArray(investments) && investments.length > 0) {
        return NextResponse.json(investments);
      }
    }
  } catch (error) {
    console.log('Backend not available, using dummy data');
  }
  
  try {
    const dataPath = join(process.cwd(), 'data', 'extracted-data-clean.json');
    const fileContents = readFileSync(dataPath, 'utf8');
    const dummyData = JSON.parse(fileContents);
    const transformedData = transformDummyData(dummyData);
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error reading dummy data:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const investment = await response.json();
      return NextResponse.json(investment);
    }
  } catch (error) {
    console.log('Backend not available, returning mock response');
  }
  
  const newInvestment = await request.json();
  return NextResponse.json({
    id: `inv-${Date.now()}`,
    ...newInvestment,
    createdAt: new Date().toISOString()
  }, { status: 201 });
}
