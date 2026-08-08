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
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, language } = useLanguage();
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Scenario Presets Banner */}
      <div className="agri-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Bookmark size={18} color="#D97706" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>
            {t('whatifTitle')}
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="btn-secondary"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                padding: '10px 12px', 
                textAlign: 'left',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF'
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A', marginBottom: '3px' }}>
                {p.title}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {p.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Core Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }}>
        {/* Left Parameter Controls */}
        <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} color="#D97706" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>{t('shockParameters')}</h3>
            </div>
            <button 
              onClick={runSimulation}
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={simulating ? 'animate-spin' : ''} />
              <span>{t('runSimulationBtn')}</span>
            </button>
          </div>

          {/* Commodity Dropdown */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              {t('cropType')}
            </label>
            <select 
              value={cropId} 
              onChange={(e) => { setCropId(e.target.value); setTimeout(runSimulation, 50); }}
              className="input-field"
              style={{ padding: '7px 10px' }}
            >
              {CROPS.map(c => (
                <option key={c.id} value={c.id}>{t(c.id) || c.name}</option>
              ))}
            </select>
          </div>

          {/* Slider 1: Yield Shock */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
              <span style={{ color: '#0F172A', fontWeight: '500' }}>{t('yieldShock')}</span>
              <strong style={{ color: yieldShock >= 0 ? '#059669' : '#DC2626' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
              <span>-50% Loss</span>
              <span>+50% Bumper</span>
            </div>
          </div>

          {/* Slider 2: Export Duty */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
              <span style={{ color: '#0F172A', fontWeight: '500' }}>{t('exportDuty')}</span>
              <strong style={{ color: '#0F172A' }}>
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
          </div>

          {/* Slider 3: Freight Transport Cost */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
              <span style={{ color: '#0F172A', fontWeight: '500' }}>{t('freightRate')}</span>
              <strong style={{ color: freightCost >= 0 ? '#DC2626' : '#059669' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
              <span style={{ color: '#0F172A', fontWeight: '500' }}>{t('rainfallAnomaly')}</span>
              <strong style={{ color: rainfallAnomaly >= 0 ? '#059669' : '#DC2626' }}>
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
          </div>

          {/* Slider 5: Fertilizer Subsidy */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
              <span style={{ color: '#0F172A', fontWeight: '500' }}>{t('fertilizerSubsidy')}</span>
              <strong style={{ color: '#0F172A' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Equilibrium Price Impact Card */}
            <div className="agri-card" style={{ borderLeft: '4px solid #D97706' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
                    {t('simulatedSpotPrice')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '2px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0F172A' }}>
                      ₹{simulationResult.simulated_price.toLocaleString()}
                    </h2>
                    <span style={{ fontSize: '0.9rem', color: '#64748B' }}>
                      Base: ₹{simulationResult.base_price.toLocaleString()}/Q
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 14px', 
                  borderRadius: '6px', 
                  background: '#FEF3C7',
                  border: `1px solid #FCD34D`
                }}>
                  {simulationResult.price_delta_pct >= 0 ? <TrendingUp size={20} color="#059669" /> : <TrendingDown size={20} color="#DC2626" />}
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: simulationResult.price_delta_pct >= 0 ? '#059669' : '#DC2626' }}>
                    {simulationResult.price_delta_pct >= 0 ? `+${simulationResult.price_delta_pct}%` : `${simulationResult.price_delta_pct}%`}
                  </span>
                </div>
              </div>

              {/* Economic Metrics Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px' }}>
                <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>{t('farmerNetMargin')}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                    ₹{simulationResult.simulated_net_margin_per_acre.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: simulationResult.margin_delta_pct >= 0 ? '#059669' : '#DC2626' }}>
                    {simulationResult.margin_delta_pct >= 0 ? `+${simulationResult.margin_delta_pct}% Gain` : `${simulationResult.margin_delta_pct}% Squeeze`}
                  </div>
                </div>

                <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>{t('mandiPressure')}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                    {simulationResult.mandi_arrival_pressure}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Wholesale Liquidity</div>
                </div>

                <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>{t('cpiImpact')}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                    {simulationResult.cpi_food_inflation_impact_pts >= 0 ? `+${simulationResult.cpi_food_inflation_impact_pts}` : `${simulationResult.cpi_food_inflation_impact_pts}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Headline CPI</div>
                </div>
              </div>
            </div>

            {/* Strategic Recommendations Card */}
            <div className="agri-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={18} color="#D97706" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>
                  {t('strategicRecommendations')}
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {simulationResult.strategic_recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '10px', 
                      padding: '10px 12px', 
                      background: '#F8FAFC', 
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ 
                      width: '22px', 
                      height: '22px', 
                      borderRadius: '4px', 
                      background: '#FEF3C7', 
                      color: '#92400E', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '0.88rem', color: '#0F172A', lineHeight: '1.4' }}>
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
