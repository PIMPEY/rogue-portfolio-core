interface Cashflow {
  amount: number;
  date: Date;
}

export function calculateXIRR(cashflows: Cashflow[]): number | null {
  if (cashflows.length < 2) {
    return null;
  }

  const sortedCashflows = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const firstDate = sortedCashflows[0].date;
  const normalizedCashflows = sortedCashflows.map(cf => ({
    amount: cf.amount,
    days: Math.floor((cf.date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
  }));

  let rate = 0.1;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (const cf of normalizedCashflows) {
      const factor = Math.pow(1 + rate, cf.days / 365);
      npv += cf.amount / factor;
      dnpv -= (cf.amount * cf.days) / (365 * factor * (1 + rate));
    }

    if (Math.abs(npv) < tolerance) {
      break;
    }

    const newRate = rate - npv / dnpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      rate = newRate;
      break;
    }

    rate = newRate;

    if (rate < -0.99) {
      rate = -0.99;
    }
    if (rate > 10) {
      rate = 10;
    }
  }

  return rate;
}

export function formatXIRR(xirr: number | null): string {
  if (xirr === null) {
    return 'N/A';
  }
  return `${(xirr * 100).toFixed(1)}%`;
}

export function calculateMOIC(totalInvested: number, currentValue: number): number {
  if (totalInvested === 0) {
    return 0;
  }
  return currentValue / totalInvested;
}

export function formatMOIC(moic: number): string {
  return `${moic.toFixed(2)}x`;
}
