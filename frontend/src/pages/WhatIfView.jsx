import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertCircle, 
  Zap,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const CROPS = [
  { id: 'wheat', name: 'Wheat (Sharbati)' },
  { id: 'rice', name: 'Paddy / Rice (Basmati)' },
  { id: 'cotton', name: 'Cotton (Medium Staple)' },
  { id: 'soybean', name: 'Soybean (Yellow)' },
  { id: 'maize', name: 'Maize (Feed Grade)' },
  { id: 'mustard', name: 'Mustard (Rapeseed)' },
  { id: 'onion', name: 'Onion (Nashik Red)' },
  { id: 'tomato', name: 'Tomato (Hybrid)' },
  { id: 'potato', name: 'Potato (Jyoti)' }
];

export default function WhatIfView() {
  const [cropId, setCropId] = useState('wheat');
  const [yieldShock, setYieldShock] = useState(-15);
  const [exportDuty, setExportDuty] = useState(20);
  const [freightCost, setFreightCost] = useState(12);
  const [rainfallAnomaly, setRainfallAnomaly] = useState(-20);
  const [fertilizerSubsidy, setFertilizerSubsidy] = useState(0);

  const [presets, setPresets] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function loadPresets() {
      const res = await api.getSimulationPresets();
      if (res && res.presets) {
        setPresets(res.presets);
      }
    }
    loadPresets();
    runSimulation();
  }, []);

  const runSimulation = async () => {
    setSimulating(true);
    const params = {
      crop_id: cropId,
      yield_shock_pct: parseFloat(yieldShock),
      export_duty_pct: parseFloat(exportDuty),
      freight_cost_pct: parseFloat(freightCost),
      rainfall_anomaly_pct: parseFloat(rainfallAnomaly),
      fertilizer_subsidy_pct: parseFloat(fertilizerSubsidy)
    };

    const res = await api.runSimulation(params);
    if (res && res.results) {
      setSimulationResult(res.results);
    } else {
      // Local fallback calculation
      const baseP = 2840;
      const netPct = (yieldShock * -0.65) + (exportDuty * -0.11) + (freightCost * 0.18);
      const simP = Math.round(baseP * (1 + netPct / 100));
      setSimulationResult({
        base_price: baseP,
        simulated_price: simP,
        price_delta_pct: netPct.toFixed(1),
        base_yield_q_acre: 18.5,
        simulated_yield_q_acre: 15.7,
        base_cost_per_acre: 24500,
        simulated_cost_per_acre: 25100,
        base_net_margin_per_acre: 28040,
        simulated_net_margin_per_acre: 25520,
        margin_delta_pct: -9.0,
        cpi_food_inflation_impact_pts: 1.15,
        mandi_arrival_pressure: "Deficit / Scarcity",
        strategic_recommendations: [
          "High price realization projected: Implement staggered selling over 60 days to capture upside.",
          "Consider warehouse storage in WDRA accredited facility."
        ]
      });
    }
    setSimulating(false);
  };

  const applyPreset = (preset) => {
    setYieldShock(preset.params.yield_shock_pct);
    setExportDuty(preset.params.export_duty_pct);
    setFreightCost(preset.params.freight_cost_pct);
    setRainfallAnomaly(preset.params.rainfall_anomaly_pct);
    setFertilizerSubsidy(preset.params.fertilizer_subsidy_pct);
    setTimeout(runSimulation, 50);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#839958', '#F7F4D5', '#105666', '#D3968C']
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Scenario Presets Banner */}
      <div className="agri-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Bookmark size={18} color="var(--color-moss-green-light)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
            Quick Scenario Presets (Climate & Macro Shocks)
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="btn-secondary"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                padding: '12px 14px', 
                textAlign: 'left',
                border: '1px solid rgba(131, 153, 88, 0.25)'
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-beige)', marginBottom: '4px' }}>
                {p.title}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {p.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Core Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px' }}>
        {/* Left Parameter Controls */}
        <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} color="var(--color-moss-green-light)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Shock Parameters</h3>
            </div>
            <button 
              onClick={runSimulation}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={simulating ? 'animate-spin' : ''} />
              <span>Simulate</span>
            </button>
          </div>

          {/* Commodity Dropdown */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Target Crop Commodity
            </label>
            <select 
              value={cropId} 
              onChange={(e) => { setCropId(e.target.value); setTimeout(runSimulation, 50); }}
              className="select-field"
            >
              {CROPS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Slider 1: Yield Shock */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Yield Shock (%)</span>
              <strong style={{ color: yieldShock >= 0 ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)' }}>
                {yieldShock >= 0 ? `+${yieldShock}%` : `${yieldShock}%`}
              </strong>
            </div>
            <input 
              type="range" 
              min="-50" 
              max="50" 
              value={yieldShock} 
              onChange={(e) => setYieldShock(e.target.value)} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>-50% Severe Crop Loss</span>
              <span>+50% Bumper Harvest</span>
            </div>
          </div>

          {/* Slider 2: Export Duty */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Export Duty / Tariff (%)</span>
              <strong style={{ color: 'var(--color-beige)' }}>
                {exportDuty >= 0 ? `+${exportDuty}%` : `${exportDuty}%`}
              </strong>
            </div>
            <input 
              type="range" 
              min="-50" 
              max="50" 
              value={exportDuty} 
              onChange={(e) => setExportDuty(e.target.value)} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>-50% Subsidy Incentive</span>
              <span>+50% Restrictive Ban</span>
            </div>
          </div>

          {/* Slider 3: Freight Transport Cost */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Diesel Freight Rate (%)</span>
              <strong style={{ color: freightCost >= 0 ? 'var(--color-rosy-brown-light)' : 'var(--color-moss-green-light)' }}>
                {freightCost >= 0 ? `+${freightCost}%` : `${freightCost}%`}
              </strong>
            </div>
            <input 
              type="range" 
              min="-30" 
              max="50" 
              value={freightCost} 
              onChange={(e) => setFreightCost(e.target.value)} 
            />
          </div>

          {/* Slider 4: Monsoon Rainfall Anomaly */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monsoon Rainfall Anomaly (%)</span>
              <strong style={{ color: rainfallAnomaly >= 0 ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)' }}>
                {rainfallAnomaly >= 0 ? `+${rainfallAnomaly}%` : `${rainfallAnomaly}%`}
              </strong>
            </div>
            <input 
              type="range" 
              min="-40" 
              max="40" 
              value={rainfallAnomaly} 
              onChange={(e) => setRainfallAnomaly(e.target.value)} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>-40% Drought Deficit</span>
              <span>+40% Excess Flooding</span>
            </div>
          </div>

          {/* Slider 5: Fertilizer Subsidy */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fertilizer Subsidy Delta (%)</span>
              <strong style={{ color: 'var(--color-beige)' }}>
                {fertilizerSubsidy >= 0 ? `+${fertilizerSubsidy}%` : `${fertilizerSubsidy}%`}
              </strong>
            </div>
            <input 
              type="range" 
              min="-40" 
              max="40" 
              value={fertilizerSubsidy} 
              onChange={(e) => setFertilizerSubsidy(e.target.value)} 
            />
          </div>
        </div>

        {/* Right Simulation Outcome Analytics */}
        {simulationResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Equilibrium Price Impact Card */}
            <div className="agri-card-solid" style={{ borderLeft: '5px solid var(--color-moss-green-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Simulated Spot Price Reaction
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '4px' }}>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                      ₹{simulationResult.simulated_price.toLocaleString()}
                    </h2>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                      Base: ₹{simulationResult.base_price.toLocaleString()}/Q
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '10px 16px', 
                  borderRadius: 'var(--radius-md)', 
                  background: simulationResult.price_delta_pct >= 0 ? 'rgba(131, 153, 88, 0.25)' : 'rgba(211, 150, 140, 0.25)',
                  border: `1px solid ${simulationResult.price_delta_pct >= 0 ? 'var(--color-moss-green)' : 'var(--color-rosy-brown)'}`
                }}>
                  {simulationResult.price_delta_pct >= 0 ? <TrendingUp size={22} color="var(--color-moss-green-light)" /> : <TrendingDown size={22} color="var(--color-rosy-brown-light)" />}
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: simulationResult.price_delta_pct >= 0 ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)' }}>
                    {simulationResult.price_delta_pct >= 0 ? `+${simulationResult.price_delta_pct}%` : `${simulationResult.price_delta_pct}%`}
                  </span>
                </div>
              </div>

              {/* Economic Metrics Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '16px' }}>
                <div style={{ padding: '12px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FARMER NET MARGIN / ACRE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                    ₹{simulationResult.simulated_net_margin_per_acre.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: simulationResult.margin_delta_pct >= 0 ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)' }}>
                    {simulationResult.margin_delta_pct >= 0 ? `+${simulationResult.margin_delta_pct}% Gain` : `${simulationResult.margin_delta_pct}% Squeeze`}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MANDI ARRIVAL PRESSURE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                    {simulationResult.mandi_arrival_pressure}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wholesale Liquidity</div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.2)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CPI FOOD INFLATION PTS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                    {simulationResult.cpi_food_inflation_impact_pts >= 0 ? `+${simulationResult.cpi_food_inflation_impact_pts}` : `${simulationResult.cpi_food_inflation_impact_pts}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Headline CPI Impact</div>
                </div>
              </div>
            </div>

            {/* Strategic Recommendations Card */}
            <div className="agri-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Zap size={18} color="var(--color-moss-green-light)" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  AI Prescriptive Response & Farm Hedging Strategy
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {simulationResult.strategic_recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px', 
                      padding: '12px 16px', 
                      background: 'rgba(10, 51, 35, 0.5)', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(131, 153, 88, 0.2)'
                    }}
                  >
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: 'var(--color-moss-green)', 
                      color: 'var(--color-beige)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-beige)', lineHeight: '1.4' }}>
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
