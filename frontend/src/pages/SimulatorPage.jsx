import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { useLanguage } from '../context/LanguageContext';

export default function SimulatorPage() {
  const { t, formatCurrency } = useLanguage();
  const [fertilizerCost, setFertilizerCost] = useState(4800); // ₹ / acre
  const [expectedYield, setExpectedYield] = useState(24); // Quintals / acre
  const [marketPrice, setMarketPrice] = useState(2840); // ₹ / quintal
  const [farmAcres, setFarmAcres] = useState(12.5); // Total Acres

  // Dynamic Math Calculations
  const grossRevenue = Math.round(farmAcres * expectedYield * marketPrice);
  const totalInputCost = Math.round(farmAcres * (fertilizerCost + 3200 + 1500)); // Fertilizer + Seeds/Labor + Irrigation
  const netProfit = grossRevenue - totalInputCost;
  const marginPct = ((netProfit / grossRevenue) * 100).toFixed(1);
  const roiPct = ((netProfit / totalInputCost) * 100).toFixed(1);

  // Scenario comparisons for Chart
  const scenarioA = Math.round(netProfit * 0.72); // Drought / High Cost
  const scenarioB = Math.round(netProfit * 0.9);  // Moderate Weather
  const currentScenario = netProfit;
  const scenarioC = Math.round(netProfit * 1.18); // Optimal Precision

  const chartData = {
    labels: ['Scenario A (Stress)', 'Scenario B (Baseline)', 'Current Plan', 'Scenario C (Precision N+K)'],
    datasets: [
      {
        label: 'Net Farm Margin (₹)',
        data: [scenarioA, scenarioB, currentScenario, scenarioC],
        backgroundColor: [
          'rgba(239, 68, 68, 0.45)',
          'rgba(20, 83, 45, 0.45)',
          'rgba(20, 83, 45, 0.85)',
          'rgba(20, 83, 45, 0.65)'
        ],
        borderColor: [
          '#ef4444',
          '#14532d',
          '#052e16',
          '#16a34a'
        ],
        borderWidth: 1.5,
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1917',
        titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        callbacks: {
          label: (context) => `Net Projected Margin: ₹${context.raw.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 10 }, color: '#78716c' }
      },
      y: {
        grid: { color: 'rgba(231, 229, 228, 0.7)', borderDash: [3, 3] },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 10 },
          color: '#78716c',
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
              {t('simulator.title')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            {t('simulator.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl mt-0.5">
            {t('simulator.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Sliders */}
        <div className="xl:col-span-4 space-y-3 sm:space-y-4">
          <div className="paper-card p-4 sm:p-5">
            <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial mb-4 pb-2.5 border-b border-[#f5f2eb]">
              Input Variables & Parameters
            </h3>

            <div className="space-y-4">
              {/* Slider 1: Fertilizer Cost */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#44403c]">Fertilizer Cost (₹/Acre)</label>
                  <span className="text-[#1c1917] bg-[#f5f2eb] px-2 py-0.5 rounded-lg border border-[#e7e5e4]">
                    ₹{fertilizerCost}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="8000"
                  step="100"
                  value={fertilizerCost}
                  onChange={(e) => setFertilizerCost(Number(e.target.value))}
                  className="w-full accent-[#14532d] cursor-pointer h-2 bg-[#e7e5e4] rounded-lg"
                />
              </div>

              {/* Slider 2: Expected Yield */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#44403c]">Expected Yield (Quintals/Acre)</label>
                  <span className="text-[#1c1917] bg-[#f5f2eb] px-2 py-0.5 rounded-lg border border-[#e7e5e4]">
                    {expectedYield} qtl
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="36"
                  step="1"
                  value={expectedYield}
                  onChange={(e) => setExpectedYield(Number(e.target.value))}
                  className="w-full accent-[#14532d] cursor-pointer h-2 bg-[#e7e5e4] rounded-lg"
                />
              </div>

              {/* Slider 3: Target Mandi Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#44403c]">Target Mandi Spot (₹/qtl)</label>
                  <span className="text-[#14532d] bg-[#f5fdf7] px-2 py-0.5 rounded-lg border border-[#bbf7d0]">
                    ₹{marketPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="4000"
                  step="20"
                  value={marketPrice}
                  onChange={(e) => setMarketPrice(Number(e.target.value))}
                  className="w-full accent-[#14532d] cursor-pointer h-2 bg-[#e7e5e4] rounded-lg"
                />
              </div>

              {/* Slider 4: Land Holdings */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#44403c]">Operational Acreage</label>
                  <span className="text-[#1c1917] bg-[#f5f2eb] px-2 py-0.5 rounded-lg border border-[#e7e5e4]">
                    {farmAcres} Acres
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={farmAcres}
                  onChange={(e) => setFarmAcres(Number(e.target.value))}
                  className="w-full accent-[#14532d] cursor-pointer h-2 bg-[#e7e5e4] rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f5f2eb] flex justify-between items-center text-xs">
              <span className="text-[11px] text-[#78716c]">2026 Rabi Model</span>
              <span className="font-extrabold text-[#14532d] bg-[#f5fdf7] border border-[#bbf7d0] px-2 py-0.5 rounded-full text-[10px]">
                Live Dynamic Math
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Scorecards & Projected Margin Chart */}
        <div className="xl:col-span-8 space-y-3 sm:space-y-4">
          {/* Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="paper-card p-3 sm:p-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#78716c] block mb-1">
                Gross Revenue
              </span>
              <div className="text-base sm:text-lg font-extrabold text-[#1c1917]">₹{grossRevenue.toLocaleString('en-IN')}</div>
            </div>

            <div className="paper-card p-3 sm:p-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#78716c] block mb-1">
                Input Expenses
              </span>
              <div className="text-base sm:text-lg font-extrabold text-[#78716c]">₹{totalInputCost.toLocaleString('en-IN')}</div>
            </div>

            <div className="paper-card p-3 sm:p-4 bg-[#f5fdf7] border border-[#bbf7d0]">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#14532d] block mb-1">
                Net Profit
              </span>
              <div className="text-base sm:text-lg font-extrabold text-[#14532d]">₹{netProfit.toLocaleString('en-IN')}</div>
            </div>

            <div className="paper-card p-3 sm:p-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#78716c] block mb-1">
                Return on Capital
              </span>
              <div className="text-base sm:text-lg font-extrabold text-[#14532d]">+{roiPct}%</div>
            </div>
          </div>

          {/* Projected Margin Bar Chart */}
          <div className="paper-card p-4 sm:p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#f5f2eb]">
              <div>
                <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial">Projected Margin Scenarios</h3>
                <p className="text-[10px] text-[#78716c]">Comparative financial yield across 4 weather and agronomy models</p>
              </div>
              <span className="bg-[#f5fdf7] border border-[#bbf7d0] text-[#14532d] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">trending_up</span> Optimized
              </span>
            </div>

            <div className="h-60 sm:h-72 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
