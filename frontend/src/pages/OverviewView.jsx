import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Database, 
  Wheat, 
  Fuel, 
  CloudRain, 
  CheckCircle2,
  Droplets,
  Layers,
  Sparkle
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import MetricCard from '../components/MetricCard';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function OverviewView() {
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('wheat');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.getOverview(selectedCrop);
      if (res && res.forecast_15_days) {
        setData(res);
      } else {
        setData({
          market_summary: {
            active_tracked_apmc: 2847,
            total_commodities: 24,
            national_model_accuracy: 94.8,
            cpi_agri_food_inflation_pct: 5.4,
            volatility_sentiment: "Moderate to Bullish",
            ai_market_verdict: "Strong post-harvest absorption across central state mandis. Staggered warehouse release recommended over 30-45 days."
          },
          forecast_15_days: [
            { day: 1, date: "08 Aug", predicted_price: 2840, upper_confidence: 2865, lower_confidence: 2815 },
            { day: 2, date: "09 Aug", predicted_price: 2848, upper_confidence: 2878, lower_confidence: 2818 },
            { day: 3, date: "10 Aug", predicted_price: 2855, upper_confidence: 2890, lower_confidence: 2820 },
            { day: 4, date: "11 Aug", predicted_price: 2862, upper_confidence: 2905, lower_confidence: 2819 },
            { day: 5, date: "12 Aug", predicted_price: 2870, upper_confidence: 2918, lower_confidence: 2822 },
            { day: 6, date: "13 Aug", predicted_price: 2878, upper_confidence: 2932, lower_confidence: 2824 },
            { day: 7, date: "14 Aug", predicted_price: 2884, upper_confidence: 2945, lower_confidence: 2823 },
            { day: 8, date: "15 Aug", predicted_price: 2892, upper_confidence: 2960, lower_confidence: 2824 },
            { day: 9, date: "16 Aug", predicted_price: 2901, upper_confidence: 2975, lower_confidence: 2827 },
            { day: 10, date: "17 Aug", predicted_price: 2908, upper_confidence: 2990, lower_confidence: 2826 },
            { day: 11, date: "18 Aug", predicted_price: 2915, upper_confidence: 3005, lower_confidence: 2825 },
            { day: 12, date: "19 Aug", predicted_price: 2922, upper_confidence: 3018, lower_confidence: 2826 },
            { day: 13, date: "20 Aug", predicted_price: 2928, upper_confidence: 3032, lower_confidence: 2824 },
            { day: 14, date: "21 Aug", predicted_price: 2934, upper_confidence: 3045, lower_confidence: 2823 },
            { day: 15, date: "22 Aug", predicted_price: 2942, upper_confidence: 3060, lower_confidence: 2824 }
          ],
          crop_snapshots: [
            { id: "wheat", name: "Wheat (Sharbati)", spot_price: 2840, change_pct: 2.4, msp_price: 2275, forecast_trend: "Bullish (+3.6%)", top_mandi: "Khanna, PB" },
            { id: "rice", name: "Paddy (Basmati)", spot_price: 3950, change_pct: -0.8, msp_price: 2183, forecast_trend: "Consolidation (-0.5%)", top_mandi: "Karnal, HR" },
            { id: "cotton", name: "Cotton (Medium)", spot_price: 7420, change_pct: 3.1, msp_price: 6620, forecast_trend: "Strong Bullish (+5.2%)", top_mandi: "Rajkot, GJ" },
            { id: "soybean", name: "Soybean (Yellow)", spot_price: 4890, change_pct: 1.7, msp_price: 4600, forecast_trend: "Bullish (+2.8%)", top_mandi: "Indore, MP" },
            { id: "mustard", name: "Mustard (Rapeseed)", spot_price: 5780, change_pct: 1.2, msp_price: 5650, forecast_trend: "Steady (+1.9%)", top_mandi: "Unjha, GJ" },
            { id: "onion", name: "Onion (Nashik Red)", spot_price: 2150, change_pct: -4.2, msp_price: 0, forecast_trend: "Volatile Recovery (+6.5%)", top_mandi: "Lasalgaon, MH" }
          ],
          macro_indicators: {
            brent_crude_usd: 78.4,
            monsoon_deviation_pct: 4.2,
            fertilizer_subsidy_index: 108.5,
            usd_inr_rate: 83.92
          }
        });
      }
      setLoading(false);
    }
    load();
  }, [selectedCrop]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="pulse-dot" style={{ width: '20px', height: '20px' }} />
      </div>
    );
  }

  // Prepare chart dataset in Yellow and White Palette
  const chartLabels = data.forecast_15_days.map(d => d.date);
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t('currentPrice'),
        data: data.forecast_15_days.map(d => d.predicted_price),
        borderColor: '#FACC15',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#EAB308',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.2,
      },
      {
        label: `${t('forecast15d')} (+95% High)`,
        data: data.forecast_15_days.map(d => d.upper_confidence),
        borderColor: '#FFFFFF',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.2,
      },
      {
        label: `${t('forecast15d')} (-95% Low)`,
        data: data.forecast_15_days.map(d => d.lower_confidence),
        borderColor: '#94A3B8',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#0F172A',
          font: { family: 'Outfit', size: 12, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#D97706',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ₹${context.parsed.y}/Q`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#E2E8F0' },
        ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        grid: { color: '#E2E8F0' },
        ticks: { 
          color: '#64748B', 
          font: { family: 'Plus Jakarta Sans', size: 11 },
          callback: (value) => `₹${value}`
        }
      }
    }
  };

  return (
    <div className="page-body">
      {/* Top Banner with Verdict */}
      <div className="agri-card" style={{ marginBottom: '24px', borderLeft: '4px solid #D97706' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={18} color="#D97706" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A' }}>
                {t('executiveOverview')}
              </h2>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
              {t('realTimePulse')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-white">
              <Database size={13} style={{ marginRight: '4px' }} />
              2,847 Mandis Synced
            </span>
            <span className="badge badge-yellow">
              <Activity size={13} style={{ marginRight: '4px' }} />
              {t('status')}
            </span>
          </div>
        </div>

        <div style={{ 
          marginTop: '14px', 
          padding: '10px 14px', 
          borderRadius: '6px', 
          background: '#F8FAFC', 
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={18} color="#D97706" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: '#0F172A', lineHeight: 1.4 }}>
            <strong>{t('forecastSubtitle')}:</strong> {data.market_summary.ai_market_verdict}
          </p>
        </div>
      </div>

      {/* KPI 4-Metric Grid */}
      <div className="metric-grid">
        <MetricCard
          title={t('nationalBenchmark')}
          value="₹2,840"
          unit="/ Quintal"
          delta="+4.8% Bullish"
          isPositive={true}
          subtext="Wheat (Sharbati Modal)"
          icon={Wheat}
        />
        <MetricCard
          title={t('aiForecastingAccuracy')}
          value={`${data.market_summary.national_model_accuracy}%`}
          unit="R² Precision"
          delta={t('highConfidence')}
          isPositive={true}
          subtext="15-Day Multi-Horizon"
          icon={Sparkle}
        />
        <MetricCard
          title={t('wdraWarehouseRoi')}
          value="+₹280"
          unit="/ Quintal Net"
          delta="+8.4% Post-Storage Gain"
          isPositive={true}
          subtext="After Stacking & Interest"
          icon={Layers}
        />
        <MetricCard
          title={t('directFarmgateTrade')}
          value="5,400+"
          unit="Metric Tons"
          delta="0% Mandi Commission"
          isPositive={true}
          subtext="Direct Escrow Contracts"
          icon={Zap}
        />
      </div>

      {/* 15-Day Price Forecast & Agronomy Matrix */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Left: 15-Day Forecast Chart */}
        <div className="agri-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#D97706" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>
                  {t('multiHorizonForecast')}
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                {t('forecastSubtitle')} ({t(selectedCrop) || selectedCrop})
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {data.crop_snapshots.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCrop(c.id)}
                  className={selectedCrop === c.id ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  {t(c.id) || c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '300px', width: '100%', marginTop: 'auto' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Agronomy Matrix Card */}
        <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} color="#D97706" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>
                {t('agronomyMatrix')}
              </h3>
            </div>

            {/* NDVI Progress */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#0F172A' }}>{t('ndviIndex')}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#D97706' }}>0.74 (Optimal Canopy)</span>
              </div>
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '74%', height: '100%', background: '#D97706', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Soil Moisture Progress */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#0F172A' }}>{t('soilMoisture')}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#059669' }}>32% (Sufficient Root Water)</span>
              </div>
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '64%', height: '100%', background: '#059669', borderRadius: '4px' }} />
              </div>
            </div>
          </div>

          {/* Spraying Window Alert Card */}
          <div style={{ 
            padding: '12px 14px', 
            borderRadius: '6px', 
            background: '#FFFBEB', 
            border: '1px solid #FCD34D',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '12px'
          }}>
            <Droplets size={22} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#92400E', marginBottom: '2px' }}>
                {t('idealSprayingWindow')}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#78350F', lineHeight: 1.3, margin: 0 }}>
                {t('optimalSprayingText')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* National Commodity Snapshots Table */}
      <div className="agri-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>
              {t('highMomentumCommodities')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              {t('forecastSubtitle')}
            </p>
          </div>
          <span className="badge badge-white">2,847 APMCs Live</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="agri-table">
            <thead>
              <tr>
                <th>{t('commodity')}</th>
                <th>{t('currentPrice')}</th>
                <th>{t('trend7d')}</th>
                <th>{t('govtMsp')}</th>
                <th>{t('mspSpread')}</th>
                <th>{t('momentum')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {data.crop_snapshots.map((crop) => {
                const spread = crop.msp_price > 0 ? (((crop.spot_price - crop.msp_price) / crop.msp_price) * 100).toFixed(1) : 'N/A';
                return (
                  <tr key={crop.id}>
                    <td>
                      <strong style={{ color: '#0F172A' }}>{t(crop.id) || crop.name}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F172A' }}>
                        ₹{crop.spot_price.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        color: crop.change_pct >= 0 ? '#059669' : '#DC2626',
                        fontWeight: '700'
                      }}>
                        {crop.change_pct >= 0 ? `+${crop.change_pct}%` : `${crop.change_pct}%`}
                      </span>
                    </td>
                    <td>{crop.msp_price > 0 ? `₹${crop.msp_price.toLocaleString()}` : 'Free Market'}</td>
                    <td>
                      {spread !== 'N/A' ? (
                        <span className={`badge ${parseFloat(spread) >= 0 ? 'badge-yellow' : 'badge-rose'}`}>
                          {parseFloat(spread) >= 0 ? `+${spread}% ${t('bullish')}` : `${spread}% ${t('bearish')}`}
                        </span>
                      ) : (
                        <span className="badge badge-dark">Deregulated</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: crop.forecast_trend.includes('Bullish') ? '#059669' : '#64748B', fontWeight: '600' }}>
                        {crop.forecast_trend.includes('Bullish') ? t('bullish') : t('neutral')}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#D97706', fontWeight: '600' }}>{crop.top_mandi}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
