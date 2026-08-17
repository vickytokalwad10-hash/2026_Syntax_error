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

export default function SimulatorPage() {
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
          'rgba(239, 68, 68, 0.4)',
          'rgba(22, 163, 74, 0.4)',
          'rgba(22, 163, 74, 0.85)',
          'rgba(22, 163, 74, 0.6)'
        ],
        borderColor: [
          '#ef4444',
          '#16a34a',
          '#15803d',
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
        backgroundColor: '#0f172a',
        titleFont: { family: 'Hanken Grotesk', size: 12, weight: 'bold' },
        bodyFont: { family: 'Hanken Grotesk', size: 13 },
        callbacks: {
          label: (context) => `Net Projected Margin: ₹${context.raw.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Hanken Grotesk', size: 11 }, color: '#475569' }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: 'Hanken Grotesk', size: 11 },
          color: '#475569',
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header from Modern Stitch Export */}
      <header className="mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          What-If Profit & Yield Simulator
        </h2>
        <p className="text-sm md:text-base text-slate-500 max-w-2xl mt-1">
          Adjust inputs to forecast potential yields, input costs, and net farm profitability. Values driven by predictive agronomic models.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sliders (from Stitch Export) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
              Input Variables & Parameters
            </h3>

            <div className="space-y-6">
              {/* Slider 1: Fertilizer Cost */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-slate-600 uppercase tracking-wider">Fertilizer Cost (₹/Acre)</label>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
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
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider 2: Expected Yield */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-slate-600 uppercase tracking-wider">Expected Yield (Quintals/Acre)</label>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
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
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider 3: Target Mandi Price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-slate-600 uppercase tracking-wider">Target Mandi Spot (₹/qtl)</label>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
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
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider 4: Land Holdings */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-slate-600 uppercase tracking-wider">Operational Acreage</label>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
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
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Calculated on 2026 Rabi Model</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                Live Dynamic Math
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex gap-6 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 block"></span>
              <span className="text-slate-700">Profit Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
              <span className="text-slate-700">Stress Risk</span>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Scorecards & Projected Margin Chart */}
        <div className="xl:col-span-8 space-y-4">
          {/* Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                Gross Revenue
              </span>
              <div className="text-xl font-bold text-slate-900">₹{grossRevenue.toLocaleString('en-IN')}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                Input Expenses
              </span>
              <div className="text-xl font-bold text-slate-700">₹{totalInputCost.toLocaleString('en-IN')}</div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block mb-1">
                Net Profit
              </span>
              <div className="text-xl font-bold text-emerald-900">₹{netProfit.toLocaleString('en-IN')}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                Return on Capital (ROI)
              </span>
              <div className="text-xl font-bold text-emerald-700">+{roiPct}%</div>
            </div>
          </div>

          {/* Projected Margin Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Projected Margin Scenarios</h3>
                <p className="text-xs text-slate-500">Comparative financial yield across 4 weather and agronomy models</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> Optimized
              </span>
            </div>

            <div className="h-64 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
