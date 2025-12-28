import { NextResponse } from "next/server";
import { evaluateFlags } from "../../../lib/flagEngine";

export async function GET() {
  const forecast = { revenue: 100, burn: 100, traction: 100 };
  const actual = { revenue: 70, burn: 120, traction: 85, runwayMonths: 7 };

  return NextResponse.json(evaluateFlags(forecast, actual));
}
