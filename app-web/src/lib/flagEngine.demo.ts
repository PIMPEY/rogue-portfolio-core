import { evaluateFlags } from "./flagEngine";

const forecast = { revenue: 100, burn: 100, traction: 100 };

// Case 1: Green
console.log("GREEN case:", evaluateFlags(forecast, { revenue: 90, burn: 120, traction: 90, runwayMonths: 8 }));

// Case 2: Amber (revenue 70% of forecast)
console.log("AMBER case:", evaluateFlags(forecast, { revenue: 70, burn: 120, traction: 85, runwayMonths: 7 }));

// Case 3: Red (runway critical)
console.log("RED case:", evaluateFlags(forecast, { revenue: 90, burn: 120, traction: 90, runwayMonths: 2 }));
