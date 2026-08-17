import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
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

export default function CropPlanningPage() {
  const { t } = useLanguage();
  const [locationState, setLocationState] = useState('Haryana');
  const [locationDistrict, setLocationDistrict] = useState('Karnal');
  const [soilType, setSoilType] = useState('Alluvial Loam');
  const [targetSeason, setTargetSeason] = useState('Rabi 2026-27');
  const [weatherOutlook, setWeatherOutlook] = useState('Normal Monsoon (+4%)');
  const [waterAvailability, setWaterAvailability] = useState('Canal + Borewell');
  const [landAcres, setLandAcres] = useState(12.5);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const states = [
    { name: 'Haryana', districts: ['Karnal', 'Kurukshetra', 'Ambala', 'Sirsa', 'Rohtak'] },
    { name: 'Punjab', districts: ['Ludhiana', 'Khanna', 'Patiala', 'Bathinda', 'Jalandhar'] },
    { name: 'Maharashtra', districts: ['Nashik', 'Pune', 'Nagpur', 'Aurangabad', 'Solapur'] },
    { name: 'Madhya Pradesh', districts: ['Indore', 'Ujjain', 'Bhopal', 'Hoshangabad', 'Dewas'] },
    { name: 'Rajasthan', districts: ['Alwar', 'Kota', 'Jaipur', 'Sri Ganganagar', 'Bikaner'] },
    { name: 'Gujarat', districts: ['Rajkot', 'Ahmedabad', 'Unjha', 'Surat', 'Mehsana'] }
  ];

  const soils = [
    'Alluvial Loam',
    'Black Cotton Soil',
    'Sandy Loam',
    'Clay Loam',
    'Red Laterite Soil'
  ];

  const seasons = [
    'Rabi 2026-27',
    'Kharif 2026',
    'Zaid (Summer 2027)'
  ];

  const weatherOutlooks = [
    'Normal Monsoon (+4%)',
    'Deficit / Drought Risk (-15%)',
    'Excess Rainfall (+12%)',
    'Early Summer Heat Wave'
  ];

  const waterSources = [
    'Canal + Borewell',
    'Borewell Only',
    'Micro-Drip / Sprinkler',
    'Rainfed Only'
  ];

  const handleFetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/crop-planning/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_state: locationState,
          location_district: locationDistrict,
          soil_type: soilType,
          target_season: targetSeason,
          weather_outlook: weatherOutlook,
          water_availability: waterAvailability,
          land_acres: parseFloat(landAcres) || 10.0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.warn('Crop planning fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchRecommendations();
  }, [locationState, locationDistrict, soilType]);

  const currentDistricts = states.find((s) => s.name === locationState)?.districts || [];

  const chartData = {
    labels: result?.recommendations.map((r) => r.crop_name) || [],
    datasets: [
      {
        label: 'Net Profit / Acre (₹)',
        data: result?.recommendations.map((r) => r.estimated_net_profit_per_acre) || [],
        backgroundColor: '#14532d',
        borderColor: '#052e16',
        borderWidth: 1.5,
        borderRadius: 8
      },
      {
        label: 'Input Cost / Acre (₹)',
        data: result?.recommendations.map((r) => r.input_cost_per_acre) || [],
        backgroundColor: '#b45309',
        borderColor: '#78350f',
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: '#1c1917',
        titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        callbacks: {
          label: (context) => `${context.dataset.label}: ₹${context.raw?.toLocaleString('en-IN') || 0}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' }, color: '#78716c' }
      },
      y: {
        grid: { color: 'rgba(231, 229, 228, 0.7)' },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 11 },
          color: '#78716c',
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] tracking-tight font-editorial flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#14532d] text-[32px]">psychology</span>
          {t('cropPlanning.title')}
        </h2>
        <p className="text-xs sm:text-sm text-[#57534e] max-w-3xl mt-1 leading-relaxed">
          {t('cropPlanning.subtitle')}
        </p>
      </div>

      {/* Input Parameters Form */}
      <div className="paper-card p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-[#1c1917] pb-3 border-b border-[#f5f2eb] flex items-center gap-2 font-editorial text-base">
          <span className="material-symbols-outlined text-[#14532d]">tune</span>
          {t('cropPlanning.title')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#44403c] mb-1">{t('cropPlanning.selectState')}</label>
            <select
              value={locationState}
              onChange={(e) => {
                setLocationState(e.target.value);
                const s = states.find((st) => st.name === e.target.value);
                if (s && s.districts.length > 0) setLocationDistrict(s.districts[0]);
              }}
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
            >
              {states.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#44403c] mb-1">{t('cropPlanning.selectDistrict')}</label>
            <select
              value={locationDistrict}
              onChange={(e) => setLocationDistrict(e.target.value)}
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
            >
              {currentDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#44403c] mb-1">{t('cropPlanning.selectSoil')}</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
            >
              {soils.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#44403c] mb-1">{t('cropPlanning.selectSeason')}</label>
            <select
              value={targetSeason}
              onChange={(e) => setTargetSeason(e.target.value)}
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
            >
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#44403c] mb-1">{t('cropPlanning.weatherOutlook')}</label>
            <select
              value={weatherOutlook}
              onChange={(e) => setWeatherOutlook(e.target.value)}
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
            >
              {weatherOutlooks.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#44403c] mb-1">Farm Land Size (Acres)</label>
            <input
              type="number"
              step="0.5"
              value={landAcres}
              onChange={(e) => setLandAcres(e.target.value)}
              className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleFetchRecommendations}
            disabled={loading}
            className="px-6 py-2.5 bg-[#14532d] hover:bg-[#052e16] text-white text-xs font-bold rounded-xl shadow-xs transition btn-tap flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">biotech</span>
            {loading ? 'Optimizing Profit Matrix...' : 'Run Agronomy Optimizer'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-extrabold text-[#1c1917] font-editorial">
              Top Ranked Crops for {locationDistrict} ({soilType})
            </h3>
            <span className="text-[11px] font-bold text-[#14532d] bg-[#f5fdf7] border border-[#bbf7d0] px-3 py-1 rounded-full">
              ✅ Forward Mandi Demand Analyzed
            </span>
          </div>

          {/* Top 3 Crop Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.recommendations.map((crop, idx) => (
              <div
                key={crop.crop_name}
                className={`paper-card p-5 flex flex-col justify-between space-y-4 ${
                  crop.is_top_choice
                    ? 'border-2 border-[#14532d] bg-[#fbfdfb]'
                    : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#e7e5e4] text-[#78716c]">
                      Rank #{crop.rank}
                    </span>
                    {crop.is_top_choice && (
                      <span className="text-[10px] font-bold bg-[#14532d] text-white px-2 py-0.5 rounded-full">
                        ⭐ Top Choice
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-extrabold text-[#1c1917] mt-2 font-editorial">{crop.crop_name}</h4>
                  <p className="text-xs text-[#78716c] font-medium">{crop.variety_recommended}</p>

                  <div className="mt-3 p-3 rounded-xl bg-[#faf8f5] border border-[#f5f2eb] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#78716c]">{t('cropPlanning.expectedMargin')}</span>
                      <span className="font-extrabold text-[#14532d]">₹{crop.estimated_net_profit_per_acre?.toLocaleString('en-IN') || 0}/acre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#78716c]">{t('simulator.costOfCultivation')}</span>
                      <span className="font-bold text-[#b45309]">₹{crop.input_cost_per_acre?.toLocaleString('en-IN') || 0}/acre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#78716c]">{t('simulator.mandiPriceAssumption')}</span>
                      <span className="font-bold text-[#1c1917]">₹{crop.projected_mandi_price}/qtl</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#78716c]">{t('simulator.roi')}</span>
                      <span className="font-extrabold text-emerald-900">{crop.roi_percentage}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#57534e] mt-3 font-medium leading-relaxed">
                    💡 {crop.rationale}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f5f2eb] flex items-center justify-between text-[11px] text-[#78716c]">
                  <span>Cycle: {crop.harvest_duration_days} Days</span>
                  <span className="font-bold text-[#14532d]">Water: {crop.water_need}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Profit vs Cost Comparison Bar Chart */}
          <div className="paper-card p-5 space-y-3">
            <h4 className="text-sm font-extrabold text-[#1c1917] font-editorial">
              Net Profit vs Cultivation Cost Comparison (₹ per Acre)
            </h4>
            <div className="h-64 w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
