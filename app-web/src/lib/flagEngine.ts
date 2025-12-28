export type FlagStatus = "GREEN" | "AMBER" | "RED";

export interface ForecastValues {
  revenue: number;
  burn: number;
  traction: number;
}

export interface ActualValues {
  revenue: number;
  burn: number;
  traction: number;
  runwayMonths: number;
}

export interface Flag {
  type: string;
  metric?: string;
  threshold: string;
  actualValue?: number;
  forecastValue?: number;
  deltaPct?: number;
}

export function evaluateFlags(
  forecast: ForecastValues,
  actual: ActualValues
): { status: FlagStatus; flags: Flag[] } {
  const flags: Flag[] = [];

  const revenuePct =
  forecast.revenue === 0
    ? actual.revenue === 0
      ? 1
      : Infinity
    : actual.revenue / forecast.revenue;

const tractionPct =
  forecast.traction === 0
    ? actual.traction === 0
      ? 1
      : Infinity
    : actual.traction / forecast.traction;

const burnPct =
  forecast.burn === 0
    ? actual.burn === 0
      ? 1
      : Infinity
    : actual.burn / forecast.burn;

  if (revenuePct < 0.5) {
    flags.push({
      type: "REVENUE_MISS",
      metric: "revenue",
      threshold: "<50% of forecast",
      actualValue: actual.revenue,
      forecastValue: forecast.revenue,
      deltaPct: revenuePct,
    });
  }

  if (tractionPct < 0.5) {
    flags.push({
      type: "TRACTION_MISS",
      metric: "traction",
      threshold: "<50% of forecast",
      actualValue: actual.traction,
      forecastValue: forecast.traction,
      deltaPct: tractionPct,
    });
  }

  if (burnPct > 1.6) {
    flags.push({
      type: "BURN_CRITICAL",
      metric: "burn",
      threshold: ">160% of forecast",
      actualValue: actual.burn,
      forecastValue: forecast.burn,
      deltaPct: burnPct,
    });
  } else if (burnPct > 1.3) {
    flags.push({
      type: "BURN_SPIKE",
      metric: "burn",
      threshold: ">130% of forecast",
      actualValue: actual.burn,
      forecastValue: forecast.burn,
      deltaPct: burnPct,
    });
  }

  if (actual.runwayMonths < 3) {
    flags.push({
      type: "RUNWAY_CRITICAL",
      threshold: "<3 months runway",
      actualValue: actual.runwayMonths,
    });
  } else if (actual.runwayMonths < 6) {
    flags.push({
      type: "RUNWAY_RISK",
      threshold: "<6 months runway",
      actualValue: actual.runwayMonths,
    });
  }

  let status: FlagStatus = "GREEN";

  if (
    revenuePct < 0.5 ||
    tractionPct < 0.5 ||
    burnPct > 1.6 ||
    actual.runwayMonths < 3
  ) {
    status = "RED";
  } else if (
    revenuePct < 0.8 ||
    tractionPct < 0.8 ||
    burnPct > 1.3 ||
    actual.runwayMonths < 6
  ) {
    status = "AMBER";
  }

  return { status, flags };
}
