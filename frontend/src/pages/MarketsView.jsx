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
  Navigation 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SUPPORTED_CROPS = [
  { id: 'wheat', name: 'Wheat (Sharbati)' },
  { id: 'rice', name: 'Paddy / Rice (Basmati)' },
  { id: 'cotton', name: 'Cotton (Medium Staple)' },
  { id: 'soybean', name: 'Soybean (Yellow)' },
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
      quantity_quintals: parseFloat(quantity),
      diesel_rate_per_liter: parseFloat(dieselRate)
    };

    const res = await api.optimizeMarkets(params);
    if (res) {
      setResult(res);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Input Parameters Bar */}
      <div className="agri-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>
            {t('cropType')}
          </label>
          <select 
            value={cropId} 
            onChange={(e) => setCropId(e.target.value)}
            className="input-field"
            style={{ padding: '7px 10px' }}
          >
            {SUPPORTED_CROPS.map(c => (
              <option key={c.id} value={c.id}>{t(c.id) || c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>
            Origin Farm / District
          </label>
          <input 
            type="text" 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)} 
            className="input-field" 
            style={{ padding: '7px 10px' }}
          />
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>
            {t('lotQuantity')}
          </label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            className="input-field" 
            style={{ padding: '7px 10px' }}
          />
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>
            Diesel (₹{dieselRate}/L)
          </label>
          <input 
            type="range" 
            min="80" 
            max="110" 
            step="0.5" 
            value={dieselRate} 
            onChange={(e) => setDieselRate(e.target.value)} 
          />
        </div>

        <button 
          onClick={runOptimizer} 
          className="btn-primary"
          style={{ height: '38px', padding: '0 20px' }}
        >
          <Sparkles size={15} />
          <span>{t('optimizeMarketsBtn')}</span>
        </button>
      </div>

      {result && result.optimal_mandi && (
        <>
          {/* Top Optimal Mandi Payout Card */}
          <div className="agri-card" style={{ borderLeft: '5px solid #FACC15', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="badge badge-yellow" style={{ marginBottom: '6px' }}>
                  <CheckCircle2 size={13} /> {t('highestRealization')}
                </span>
                <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#FFFFFF' }}>
                  {result.optimal_mandi.mandi_name} ({result.optimal_mandi.state})
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
                  Distance: <strong>{result.optimal_mandi.distance_km} km</strong> from {origin} • Mandi Cess: ₹{result.optimal_mandi.cess_cost_per_q}/Q
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Estimated Net Payout
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#FFFFFF' }}>
                  ₹{result.optimal_mandi.total_net_payout.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#FACC15', fontWeight: '700' }}>
                  ₹{result.optimal_mandi.net_realized_price_per_q} / Quintal Net
                </div>
              </div>
            </div>

            {/* AI Decision Badge Banner */}
            {result.ai_decision_badge && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 14px', 
                background: '#1E293B', 
                borderRadius: '4px',
                border: '1px solid #374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} color="#FACC15" />
                  <div>
                    <strong style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>
                      {result.ai_decision_badge.action}
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      {result.ai_decision_badge.key_reason}
                    </div>
                  </div>
                </div>
                <span className="badge badge-yellow" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                  {result.ai_decision_badge.payout_gain_estimate}
                </span>
              </div>
            )}
          </div>

          {/* Multi-APMC Mandi Arbitrage Table */}
          <div className="agri-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF' }}>
                  {t('arbitrageTitle')}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  All deductions included (diesel freight per distance, loading/unloading labor, statutory market cess)
                </p>
              </div>
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
                    <tr key={m.mandi_id}>
                      <td>
                        <strong style={{ color: '#FFFFFF' }}>{m.mandi_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{m.district}, {m.state}</div>
                      </td>
                      <td>{m.distance_km} km</td>
                      <td>₹{m.gross_spot_price.toLocaleString()}</td>
                      <td>₹{m.freight_cost_per_q}</td>
                      <td>₹{m.total_deductions_per_q - m.freight_cost_per_q}</td>
                      <td>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: m.is_optimal ? '#FACC15' : '#FFFFFF' }}>
                          ₹{m.net_realized_price_per_q.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: '#FFFFFF' }}>
                          ₹{m.total_net_payout.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        {m.is_optimal ? (
                          <span className="badge badge-yellow">Optimal Choice</span>
                        ) : (
                          <span style={{ color: '#F87171', fontSize: '0.8rem' }}>
                            -₹{m.loss_vs_optimal_per_q}/Q Loss
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF' }}>
                  {t('storageMatrixTitle')}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Evaluates holding returns against warehouse rent (₹28/Q/mo), working capital interest (9% p.a.), and natural moisture loss
                </p>
              </div>
              <span className="badge badge-white">WDRA Rates</span>
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
                        <strong style={{ color: '#FFFFFF' }}>{row.horizon}</strong>
                      </td>
                      <td>₹{row.expected_price.toLocaleString()}</td>
                      <td>₹{row.storage_cost + row.interest_cost}</td>
                      <td>{row.weight_loss_pct}%</td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: '#FFFFFF' }}>
                          ₹{row.net_return_per_q.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: row.net_gain_vs_now_per_q >= 0 ? '#FACC15' : '#F87171', fontWeight: '700' }}>
                          {row.net_gain_vs_now_per_q >= 0 ? `+₹${row.net_gain_vs_now_per_q}` : `-₹${Math.abs(row.net_gain_vs_now_per_q)}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: row.roi_pct >= 0 ? '#FACC15' : '#F87171', fontWeight: '700' }}>
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
