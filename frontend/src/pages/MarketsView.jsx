import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Truck, 
  BadgeIndianRupee, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Navigation,
  Fuel,
  Scale,
  MapPin,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SUPPORTED_CROPS = [
  { id: 'wheat', name: 'Wheat (Sharbati Gold)' },
  { id: 'rice', name: 'Paddy / Rice (Basmati 1121)' },
  { id: 'cotton', name: 'Cotton (Medium Staple)' },
  { id: 'soybean', name: 'Soybean (Yellow Grade)' },
  { id: 'mustard', name: 'Mustard (Rapeseed)' },
  { id: 'onion', name: 'Onion (Nashik Red)' },
  { id: 'tomato', name: 'Tomato (Hybrid)' },
  { id: 'potato', name: 'Potato (Jyoti)' }
];

export default function MarketsView() {
  const { t, language } = useLanguage();
  const [cropId, setCropId] = useState('wheat');
  const [origin, setOrigin] = useState('Karnal, Haryana');
  const [quantity, setQuantity] = useState(100);
  const [dieselRate, setDieselRate] = useState(89.5);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runOptimizer();
  }, []);

  const runOptimizer = async () => {
    setLoading(true);
    const params = {
      crop_id: cropId,
      origin_district: origin,
      quantity_quintals: parseFloat(quantity) || 100,
      diesel_rate_per_liter: parseFloat(dieselRate) || 89.5
    };

    const res = await api.optimizeMarkets(params);
    if (res) {
      setResult(res);
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.65 } });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Parameter Control Header */}
      <div className="agri-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC' }}>
              {t('marketsTitle')}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '2px' }}>
              Real-time spatial net realization calculator across 2,800+ APMC mandis including transit diesel & statutory cess.
            </p>
          </div>
          <span className="badge badge-yellow" style={{ fontSize: '0.72rem' }}>
            <Navigation size={12} /> Distance & Freight Calibrated
          </span>
        </div>

        {/* Input Parameters Bar with explicit dark backgrounds */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '14px', 
          alignItems: 'end',
          background: '#111827',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #263449'
        }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              {t('cropType')}
            </label>
            <select 
              value={cropId} 
              onChange={(e) => setCropId(e.target.value)}
              className="input-field"
              style={{ background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', width: '100%' }}
            >
              {SUPPORTED_CROPS.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#1E293B', color: '#F8FAFC' }}>
                  {t(c.id) || c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Origin Farm / District
            </label>
            <input 
              type="text" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)} 
              className="input-field" 
              placeholder="e.g. Karnal, Haryana"
              style={{ background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              {t('lotQuantity')} (Quintals)
            </label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              className="input-field" 
              min="1"
              style={{ background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Diesel Rate
              </label>
              <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: '700' }}>₹{dieselRate}/L</span>
            </div>
            <input 
              type="range" 
              min="80" 
              max="110" 
              step="0.5" 
              value={dieselRate} 
              onChange={(e) => setDieselRate(e.target.value)} 
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <button 
              onClick={runOptimizer} 
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: '38px' }}
            >
              <Sparkles size={15} />
              <span>{loading ? t('loading') : t('optimizeMarketsBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {result && result.optimal_mandi && (
        <>
          {/* Top Optimal Mandi Payout Card */}
          <div className="agri-card" style={{ borderLeft: '4px solid #F59E0B', padding: '22px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-yellow" style={{ marginBottom: '8px' }}>
                  <CheckCircle2 size={12} /> {t('highestRealization')}
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#F8FAFC' }}>
                  {result.optimal_mandi.mandi_name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '0.82rem', color: '#94A3B8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#F59E0B" /> {result.optimal_mandi.district}, {result.optimal_mandi.state}
                  </span>
                  <span>•</span>
                  <span>Distance: <strong style={{ color: '#F8FAFC' }}>{result.optimal_mandi.distance_km} km</strong></span>
                  <span>•</span>
                  <span>Mandi Cess: <strong style={{ color: '#F8FAFC' }}>₹{result.optimal_mandi.cess_cost_per_q}/Q</strong></span>
                </div>
              </div>

              <div style={{ textAlign: 'right', background: '#111827', padding: '12px 20px', borderRadius: '6px', border: '1px solid #263449' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Estimated Net Payout
                </span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#F8FAFC', lineHeight: '1.2' }}>
                  ₹{result.optimal_mandi.total_net_payout.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#F59E0B', fontWeight: '700' }}>
                  ₹{result.optimal_mandi.net_realized_price_per_q.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/ Quintal Net</span>
                </div>
              </div>
            </div>

            {/* AI Decision Badge Banner */}
            {result.ai_decision_badge && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                background: '#1E293B', 
                borderRadius: '6px',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} color="#F59E0B" />
                  <div>
                    <strong style={{ color: '#F8FAFC', fontSize: '0.88rem' }}>
                      {result.ai_decision_badge.action}
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      {result.ai_decision_badge.key_reason}
                    </div>
                  </div>
                </div>
                <span className="badge badge-yellow" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                  {result.ai_decision_badge.payout_gain_estimate}
                </span>
              </div>
            )}
          </div>

          {/* Multi-APMC Mandi Arbitrage Table */}
          <div className="agri-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
                  {t('arbitrageTitle')}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  All deductions accounted for (freight per km, labor charges, statutory mandi cess)
                </p>
              </div>
              <span className="badge badge-white" style={{ fontSize: '0.7rem' }}>
                {result.mandi_arbitrage_rankings.length} Markets Analyzed
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>{t('mandiName')}</th>
                    <th>{t('distance')}</th>
                    <th>{t('grossPrice')}</th>
                    <th>{t('freight')}</th>
                    <th>{t('cessFees')}</th>
                    <th>{t('netRealized')}</th>
                    <th>{t('totalPayout')}</th>
                    <th>{t('arbitrageStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.mandi_arbitrage_rankings.map((m) => (
                    <tr key={m.mandi_id} style={{ background: m.is_optimal ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                      <td>
                        <strong style={{ color: '#F8FAFC' }}>{m.mandi_name}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{m.district}, {m.state}</div>
                      </td>
                      <td>{m.distance_km} km</td>
                      <td>₹{m.gross_spot_price.toLocaleString()}</td>
                      <td>₹{m.freight_cost_per_q}</td>
                      <td>₹{m.total_deductions_per_q - m.freight_cost_per_q}</td>
                      <td>
                        <span style={{ fontSize: '0.98rem', fontWeight: '800', color: m.is_optimal ? '#F59E0B' : '#F8FAFC' }}>
                          ₹{m.net_realized_price_per_q.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: '#F8FAFC' }}>
                          ₹{m.total_net_payout.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        {m.is_optimal ? (
                          <span className="badge badge-yellow">Optimal Choice</span>
                        ) : (
                          <span style={{ color: '#F87171', fontSize: '0.78rem', fontWeight: '600' }}>
                            -₹{m.loss_vs_optimal_per_q}/Q
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sell Now vs Store Decision Matrix */}
          <div className="agri-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
                  {t('storageMatrixTitle')}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Evaluates holding returns against warehouse rent (₹28/Q/mo), working capital interest (9% p.a.), and natural moisture loss
                </p>
              </div>
              <span className="badge badge-white" style={{ fontSize: '0.7rem' }}>WDRA Standard</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Storage Horizon</th>
                    <th>Expected Spot Price</th>
                    <th>Storage & Int. Cost</th>
                    <th>Moisture Loss</th>
                    <th>Net Return (₹/Q)</th>
                    <th>Net Gain vs Day 0</th>
                    <th>Holding ROI (%)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {result.sell_vs_store_matrix.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong style={{ color: '#F8FAFC' }}>{row.horizon}</strong>
                      </td>
                      <td>₹{row.expected_price.toLocaleString()}</td>
                      <td>₹{row.storage_cost + row.interest_cost}</td>
                      <td>{row.weight_loss_pct}%</td>
                      <td>
                        <strong style={{ fontSize: '0.95rem', color: '#F8FAFC' }}>
                          ₹{row.net_return_per_q.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: row.net_gain_vs_now_per_q >= 0 ? '#10B981' : '#F87171', fontWeight: '700' }}>
                          {row.net_gain_vs_now_per_q >= 0 ? `+₹${row.net_gain_vs_now_per_q}` : `-₹${Math.abs(row.net_gain_vs_now_per_q)}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: row.roi_pct >= 0 ? '#10B981' : '#F87171', fontWeight: '700' }}>
                          {row.roi_pct >= 0 ? `+${row.roi_pct}%` : `${row.roi_pct}%`}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${row.roi_pct > 4.5 ? 'badge-yellow' : (row.roi_pct > 0 ? 'badge-white' : 'badge-rose')}`}>
                          {row.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
