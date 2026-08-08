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
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Input Parameters Bar */}
      <div className="agri-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Crop Commodity
          </label>
          <select 
            value={cropId} 
            onChange={(e) => setCropId(e.target.value)}
            className="select-field"
          >
            {SUPPORTED_CROPS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Origin Farm / District
          </label>
          <input 
            type="text" 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)} 
            className="input-field" 
          />
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Lot Size (Quintals)
          </label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            className="input-field" 
          />
        </div>

        <div style={{ flex: '1 1 160px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
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
          style={{ height: '42px', padding: '0 24px' }}
        >
          <Sparkles size={16} />
          <span>Optimize Mandis</span>
        </button>
      </div>

      {result && result.optimal_mandi && (
        <>
          {/* Top Optimal Mandi Payout Card */}
          <div className="agri-card-solid" style={{ borderLeft: '6px solid var(--color-moss-green-light)', padding: '26px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-moss" style={{ marginBottom: '8px' }}>
                  <CheckCircle2 size={13} /> #1 HIGHEST NET REALIZATION APMC
                </span>
                <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                  {result.optimal_mandi.mandi_name} ({result.optimal_mandi.state})
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Distance: <strong>{result.optimal_mandi.distance_km} km</strong> from {origin} • Mandi Cess: {result.optimal_mandi.cess_cost_per_q} ₹/Q
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Estimated Total Net Payout
                </span>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                  ₹{result.optimal_mandi.total_net_payout.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-moss-green-light)', fontWeight: '700' }}>
                  ₹{result.optimal_mandi.net_realized_price_per_q} / Quintal Net
                </div>
              </div>
            </div>

            {/* AI Decision Badge Banner */}
            {result.ai_decision_badge && (
              <div style={{ 
                marginTop: '20px', 
                padding: '14px 18px', 
                background: 'rgba(16, 86, 102, 0.35)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-midnight-green-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--color-moss-green-light)" />
                  <div>
                    <strong style={{ color: 'var(--color-beige)', fontSize: '0.95rem' }}>
                      {result.ai_decision_badge.action}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {result.ai_decision_badge.key_reason}
                    </div>
                  </div>
                </div>
                <span className="badge badge-moss" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  {result.ai_decision_badge.payout_gain_estimate}
                </span>
              </div>
            )}
          </div>

          {/* Multi-APMC Mandi Arbitrage Table */}
          <div className="agri-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                  APMC Mandi Arbitrage & Net Revenue Rankings
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  All deductions included (diesel freight per distance, loading/unloading labor, statutory market cess)
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="agri-table">
                <thead>
                  <tr>
                    <th>Mandi Name & Location</th>
                    <th>Distance</th>
                    <th>Gross Spot Price</th>
                    <th>Freight (₹/Q)</th>
                    <th>Cess & Fees</th>
                    <th>Net Price (₹/Q)</th>
                    <th>Total Payout ({quantity} Q)</th>
                    <th>Arbitrage Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.mandi_arbitrage_rankings.map((m) => (
                    <tr key={m.mandi_id}>
                      <td>
                        <strong style={{ color: 'var(--color-beige)' }}>{m.mandi_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.district}, {m.state}</div>
                      </td>
                      <td>{m.distance_km} km</td>
                      <td>₹{m.gross_spot_price.toLocaleString()}</td>
                      <td>₹{m.freight_cost_per_q}</td>
                      <td>₹{m.total_deductions_per_q - m.freight_cost_per_q}</td>
                      <td>
                        <span style={{ fontSize: '1.05rem', fontWeight: '800', color: m.is_optimal ? 'var(--color-moss-green-light)' : 'var(--color-beige)' }}>
                          ₹{m.net_realized_price_per_q.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: 'var(--color-beige)' }}>
                          ₹{m.total_net_payout.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        {m.is_optimal ? (
                          <span className="badge badge-moss">Optimal Choice</span>
                        ) : (
                          <span style={{ color: 'var(--color-rosy-brown-light)', fontSize: '0.8rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                  Sell Now vs. WDRA Warehouse Storage Matrix
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Evaluates holding returns against warehouse rent (₹28/Q/mo), working capital interest (9% p.a.), and natural moisture loss
                </p>
              </div>
              <span className="badge badge-midnight">WDRA Accredited Rates</span>
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
                        <strong style={{ color: 'var(--color-beige)' }}>{row.horizon}</strong>
                      </td>
                      <td>₹{row.expected_price.toLocaleString()}</td>
                      <td>₹{row.storage_cost + row.interest_cost}</td>
                      <td>{row.weight_loss_pct}%</td>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--color-beige)' }}>
                          ₹{row.net_return_per_q.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: row.net_gain_vs_now_per_q >= 0 ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)', fontWeight: '700' }}>
                          {row.net_gain_vs_now_per_q >= 0 ? `+₹${row.net_gain_vs_now_per_q}` : `-₹${Math.abs(row.net_gain_vs_now_per_q)}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: row.roi_pct >= 0 ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)', fontWeight: '700' }}>
                          {row.roi_pct >= 0 ? `+${row.roi_pct}%` : `${row.roi_pct}%`}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${row.roi_pct > 4.5 ? 'badge-moss' : (row.roi_pct > 0 ? 'badge-midnight' : 'badge-rose')}`}>
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
