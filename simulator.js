/* ==========================================================================
   AgriPulse — simulator.js
   --------------------------------------------------------------------------
   The What-If Simulator.

   This is a simple, transparent arithmetic model written for the demo.
   It is NOT a machine-learning prediction. Each input is given a weight
   and the weighted sum becomes the estimated price impact.
   ========================================================================== */

/* How strongly each input pushes the price, per 1% of change. */
const SIM_WEIGHTS = {
  supply: -0.45,  // more supply pushes prices down
  demand: 0.55,   // more demand pushes prices up
  export: 0.30    // stronger exports pull prices up
};

/* Rainfall is a category, not a percentage, so it adds a flat effect. */
const RAINFALL_EFFECT = {
  below:  -1.0,   // easy movement to the mandi, supply stays comfortable
  normal:  0,
  above:   3.0    // heavy rain slows arrivals, which supports prices
};

/**
 * Calculates a scenario forecast from the baseline.
 * @param {number} baseline  baseline 7-day forecast in ₹
 * @param {object} inputs    { supply, demand, exports, rainfall }
 * @returns {{ scenario: number, impactPct: number, direction: string }}
 */
function runScenario(baseline, inputs) {
  let impactPct =
    inputs.supply * SIM_WEIGHTS.supply +
    inputs.demand * SIM_WEIGHTS.demand +
    inputs.exports * SIM_WEIGHTS.export +
    RAINFALL_EFFECT[inputs.rainfall];

  // Keep the demo inside a believable range.
  impactPct = Math.max(-25, Math.min(25, impactPct));

  const scenario = Math.round(baseline * (1 + impactPct / 100));

  let direction = 'flat';
  if (impactPct > 0.5) direction = 'up';
  else if (impactPct < -0.5) direction = 'down';

  return { scenario: scenario, impactPct: impactPct, direction: direction };
}

/** Plain-language line describing the scenario result. */
function scenarioMessage(direction) {
  if (direction === 'up') return '↑ Price likely to increase';
  if (direction === 'down') return '↓ Price likely to decrease';
  return '→ Price likely to stay flat';
}

/** The largest contributing input, so the UI can explain the result. */
function topScenarioDriver(inputs) {
  const contributions = [
    { label: 'supply change',   value: Math.abs(inputs.supply * SIM_WEIGHTS.supply) },
    { label: 'demand change',   value: Math.abs(inputs.demand * SIM_WEIGHTS.demand) },
    { label: 'export change',   value: Math.abs(inputs.exports * SIM_WEIGHTS.export) },
    { label: 'rainfall',        value: Math.abs(RAINFALL_EFFECT[inputs.rainfall]) }
  ];
  contributions.sort(function (a, b) { return b.value - a.value; });
  return contributions[0].value === 0 ? null : contributions[0].label;
}
