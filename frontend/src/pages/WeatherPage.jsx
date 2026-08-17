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
    { day: 'Today', date: '18 Aug', temp: '28°C', condition: 'Sunny / Mild', rain: '10%', wind: '8 km/h', icon: 'sunny', safety: 'Optimal' },
    { day: 'Wed', date: '19 Aug', temp: '29°C', condition: 'Partly Cloudy', rain: '20%', wind: '12 km/h', icon: 'partly_cloudy_day', safety: 'Optimal' },
    { day: 'Thu', date: '20 Aug', temp: '25°C', condition: 'Moderate Rain', rain: '75%', wind: '22 km/h', icon: 'rainy', safety: 'High Risk' },
    { day: 'Fri', date: '21 Aug', temp: '24°C', condition: 'Heavy Showers', rain: '85%', wind: '28 km/h', icon: 'thunderstorm', safety: 'Hazard' },
    { day: 'Sat', date: '22 Aug', temp: '26°C', condition: 'Scattered Clouds', rain: '30%', wind: '14 km/h', icon: 'cloud', safety: 'Moderate' },
    { day: 'Sun', date: '23 Aug', temp: '28°C', condition: 'Clear Sky', rain: '5%', wind: '9 km/h', icon: 'sunny', safety: 'Optimal' },
    { day: 'Mon', date: '24 Aug', temp: '30°C', condition: 'Warm & Dry', rain: '0%', wind: '7 km/h', icon: 'sunny', safety: 'Optimal' }
  ];

  const currentDay = forecastDays[selectedDay];

  const radarData = {
    labels: ['Heat Stress', 'Pest Risk', 'Frost Risk', 'Evapotranspiration', 'Soil Drought', 'Wind Drift'],
    datasets: [
      {
        label: 'Current Field Risk Index',
        data: selectedDay === 2 || selectedDay === 3 ? [45, 88, 10, 40, 20, 85] : [65, 30, 15, 75, 42, 25],
        backgroundColor: 'rgba(20, 83, 45, 0.22)',
        borderColor: '#14532d',
        pointBackgroundColor: '#14532d',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#14532d',
        borderWidth: 2.5
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1917',
        titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 11 }
      }
    },
    scales: {
      r: {
        angleLines: { color: '#e7e5e4' },
        grid: { color: '#f5f2eb' },
        pointLabels: {
          font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' },
          color: '#57534e'
        },
        ticks: { display: false, maxTicksLimit: 5 }
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
              Microclimate Radar
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            मौसम व स्प्रे रडार • Weather & Agronomy Telemetry
          </h2>
        </div>
        <span className="text-xs font-bold text-[#78716c]">Karnal District • Updated 10m ago</span>
      </div>

      {/* Spraying Safety Index Banner */}
      <div className="paper-card p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 border-l-4 border-l-[#14532d]">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#14532d] text-[22px]">agriculture</span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#1c1917] font-editorial">
              छिड़काव व उर्वरक विंडो • Spraying & Fertilization Window
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5fdf7] text-[#14532d] border border-[#bbf7d0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14532d] animate-pulse"></span>
              Live Safety Index
            </span>
          </div>
          <p className="text-xs text-[#57534e] mb-3">
            Optimal chemical adherence window: <strong className="text-[#1c1917]">06:00 AM — 09:30 AM</strong> (Low wind speed &lt; 9 km/h, no dew condensation).
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <div className="bg-[#faf8f5] px-2.5 py-1.5 rounded-xl border border-[#e7e5e4] flex items-center gap-1.5 text-[#1c1917]">
              <span className="material-symbols-outlined text-[16px] text-[#14532d]">air</span>
              Wind Drift: <span className="text-[#14532d]">8 km/h (Safe)</span>
            </div>
            <div className="bg-[#faf8f5] px-2.5 py-1.5 rounded-xl border border-[#e7e5e4] flex items-center gap-1.5 text-[#1c1917]">
              <span className="material-symbols-outlined text-[16px] text-blue-700">thermostat</span>
              Temperature: <span className="text-[#1c1917]">28°C (Optimal)</span>
            </div>
            <div className="bg-[#faf8f5] px-2.5 py-1.5 rounded-xl border border-[#e7e5e4] flex items-center gap-1.5 text-[#1c1917]">
              <span className="material-symbols-outlined text-[16px] text-[#b45309]">water_drop</span>
              Humidity: <span className="text-[#1c1917]">54% (No wash-off)</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-[#f5fdf7] px-4 py-3 rounded-2xl border border-[#bbf7d0] w-full lg:w-auto">
          <span className="material-symbols-outlined text-[#14532d] text-[28px]">check_circle</span>
          <div>
            <span className="text-[9px] font-extrabold text-[#14532d] uppercase tracking-wider block">Window Status</span>
            <span className="text-sm font-extrabold text-[#052e16]">RECOMMENDED TO SPRAY</span>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Strip: Scrollable on mobile */}
      <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-2.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        {forecastDays.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shrink-0 w-[140px] sm:w-auto ${
              selectedDay === idx
                ? 'bg-[#14532d] text-white border-[#14532d] shadow-sm'
                : 'paper-card hover:border-[#b45309]'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${selectedDay === idx ? 'text-emerald-200' : 'text-[#78716c]'}`}>
                {item.day}
              </span>
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            </div>
            <div className="text-lg font-extrabold mb-0.5">{item.temp}</div>
            <p className={`text-[10px] truncate mb-2 ${selectedDay === idx ? 'text-emerald-100' : 'text-[#78716c]'}`}>
              {item.condition}
            </p>
            <div className="flex items-center justify-between text-[9px] font-bold pt-1.5 border-t border-black/10">
              <span>Rain: {item.rain}</span>
              <span>{item.wind}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 2-Column Grid: Radar Chart & Sub-surface Soil Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Agronomy Risk Radar */}
        <div className="lg:col-span-7 paper-card p-4 sm:p-5">
          <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-[#f5f2eb]">
            <div>
              <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial">Agronomic Risk Matrix</h3>
              <span className="text-[10px] text-[#78716c]">6-factor stress analysis for {currentDay.day} ({currentDay.date})</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#14532d] bg-[#f5fdf7] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full">
              {currentDay.safety}
            </span>
          </div>

          <div className="h-60 sm:h-72 w-full">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Sub-Surface Soil Telemetry */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          <div className="paper-card p-4 sm:p-5">
            <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-700 text-[18px]">sensors</span>
              Sub-Surface Soil Moisture Telemetry
            </h3>

            <div className="space-y-3 text-xs">
              {/* Sensor 1 */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-[#44403c]">Topsoil (5 cm Depth)</span>
                  <span className="text-[#14532d] font-extrabold">26.4% Moisture (Normal)</span>
                </div>
                <div className="w-full bg-[#f5f2eb] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#14532d] h-full rounded-full" style={{ width: '58%' }}></div>
                </div>
              </div>

              {/* Sensor 2 */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-[#44403c]">Active Root Zone (15 cm Depth)</span>
                  <span className="text-[#14532d] font-extrabold">34.8% Moisture (Optimal)</span>
                </div>
                <div className="w-full bg-[#f5f2eb] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#14532d] h-full rounded-full" style={{ width: '74%' }}></div>
                </div>
              </div>

              {/* Sensor 3 */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-[#44403c]">Deep Subsoil (30 cm Depth)</span>
                  <span className="text-blue-700 font-extrabold">42.1% Moisture (Saturated)</span>
                </div>
                <div className="w-full bg-[#f5f2eb] h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Advisory */}
          <div className="paper-card p-4 bg-[#fffbeb] border-l-4 border-l-[#b45309] text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-[#92400e] mb-1 font-editorial text-sm">
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              Irrigation Automation Advisory
            </div>
            <p className="text-[#78350f] leading-relaxed text-[11px] font-medium">
              With root zone moisture at 34.8% and rain probability rising to 75% on Thursday, defer scheduled canal irrigation to conserve electricity and avoid waterlogging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
