import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function WeatherPage() {
  const [selectedDay, setSelectedDay] = useState(0);

  const forecastDays = [
    { day: 'Today', date: '17 Oct', temp: '28°C', condition: 'Sunny / Mild', rain: '10%', wind: '8 km/h', icon: 'sunny', safety: 'Optimal' },
    { day: 'Tue', date: '18 Oct', temp: '29°C', condition: 'Partly Cloudy', rain: '20%', wind: '12 km/h', icon: 'partly_cloudy_day', safety: 'Optimal' },
    { day: 'Wed', date: '19 Oct', temp: '25°C', condition: 'Moderate Rain', rain: '75%', wind: '22 km/h', icon: 'rainy', safety: 'High Risk' },
    { day: 'Thu', date: '20 Oct', temp: '24°C', condition: 'Heavy Showers', rain: '85%', wind: '28 km/h', icon: 'thunderstorm', safety: 'Hazard' },
    { day: 'Fri', date: '21 Oct', temp: '26°C', condition: 'Scattered Clouds', rain: '30%', wind: '14 km/h', icon: 'cloud', safety: 'Moderate' },
    { day: 'Sat', date: '22 Oct', temp: '28°C', condition: 'Clear Sky', rain: '5%', wind: '9 km/h', icon: 'sunny', safety: 'Optimal' },
    { day: 'Sun', date: '23 Oct', temp: '30°C', condition: 'Warm & Dry', rain: '0%', wind: '7 km/h', icon: 'sunny', safety: 'Optimal' }
  ];

  const currentDay = forecastDays[selectedDay];

  const radarData = {
    labels: ['Heat Stress', 'Pest Risk', 'Frost Risk', 'Evapotranspiration', 'Soil Drought', 'Wind Drift'],
    datasets: [
      {
        label: 'Current Field Risk Index',
        data: selectedDay === 2 || selectedDay === 3 ? [45, 88, 10, 40, 20, 85] : [65, 30, 15, 75, 42, 25],
        backgroundColor: 'rgba(22, 163, 74, 0.25)',
        borderColor: '#16a34a',
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#16a34a',
        borderWidth: 2
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Hanken Grotesk', size: 12 },
        bodyFont: { family: 'Hanken Grotesk', size: 12 }
      }
    },
    scales: {
      r: {
        angleLines: { color: '#e2e8f0' },
        grid: { color: '#f1f5f9' },
        pointLabels: {
          font: { family: 'Hanken Grotesk', size: 11, weight: 'bold' },
          color: '#475569'
        },
        ticks: { display: false, maxTicksLimit: 5 }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header from Modern Stitch Export */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">
          Weather & Agronomy Radar
        </h2>
        <p className="text-sm md:text-base text-slate-500 max-w-2xl">
          Hyperlocal microclimate telemetry and operational spraying safety indices. Updated 10 mins ago.
        </p>
      </div>

      {/* Spraying Safety Index Banner (from Stitch Export) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-emerald-700 text-[24px]">agriculture</span>
            <h3 className="text-lg font-bold text-slate-900">Spraying & Fertilization Window</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Safety Index
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Optimal chemical adherence window: <span className="font-bold text-slate-900">06:00 AM — 09:30 AM</span> (Low wind speed &lt; 9 km/h, no dew condensation).
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">air</span>
              Wind Drift: <span className="text-slate-900">8 km/h (Safe)</span>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">thermostat</span>
              Temperature: <span className="text-slate-900">28°C (Optimal)</span>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-600">water_drop</span>
              Humidity: <span className="text-slate-900">54% (No wash-off)</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-emerald-50 px-5 py-3.5 rounded-xl border border-emerald-200">
          <span className="material-symbols-outlined text-emerald-700 text-[32px]">check_circle</span>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Window Status</span>
            <span className="text-base font-extrabold text-emerald-900">RECOMMENDED TO SPRAY</span>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Horizontal Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecastDays.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              selectedDay === idx
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-md transform -translate-y-1'
                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-bold ${selectedDay === idx ? 'text-emerald-200' : 'text-slate-600'}`}>
                {item.day}
              </span>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <div className="text-xl font-bold mb-1">{item.temp}</div>
            <p className={`text-[11px] truncate mb-2 ${selectedDay === idx ? 'text-emerald-100' : 'text-slate-600'}`}>
              {item.condition}
            </p>
            <div className="flex items-center justify-between text-[10px] font-semibold pt-2 border-t border-slate-100/30">
              <span>Rain: {item.rain}</span>
              <span>{item.wind}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 2-Column Grid: Radar Chart & Sub-surface Soil Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agronomy Risk Radar (from Stitch Export) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Agronomic Risk Matrix</h3>
              <span className="text-xs text-slate-500">6-factor stress analysis for {currentDay.day} ({currentDay.date})</span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
              Index: {currentDay.safety}
            </span>
          </div>

          <div className="h-64 w-full">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Sub-Surface Soil Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">sensors</span>
              Sub-Surface Soil Telemetry
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* Sensor 1 */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Topsoil (5 cm Depth)</span>
                  <span className="text-emerald-800 font-bold">26.4% Moisture (Normal)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '58%' }}></div>
                </div>
              </div>

              {/* Sensor 2 */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Active Root Zone (15 cm Depth)</span>
                  <span className="text-emerald-800 font-bold">34.8% Moisture (Optimal)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '74%' }}></div>
                </div>
              </div>

              {/* Sensor 3 */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Deep Subsoil (30 cm Depth)</span>
                  <span className="text-blue-700 font-bold">42.1% Moisture (Saturated)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Advisory */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
              <span className="material-symbols-outlined text-[18px] text-amber-700">lightbulb</span>
              Irrigation Automation Advisory
            </div>
            <p className="text-amber-800 leading-relaxed">
              With root zone moisture at 34.8% and rain probability rising to 75% on Wednesday, defer scheduled canal irrigation to save 1,400 units of power.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
