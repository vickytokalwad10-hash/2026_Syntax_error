import React, { useState, useEffect } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { cacheData, getCachedData } from '../services/offlineDb';

export default function IrrigationPage() {
  const { isOnline } = useNetwork();
  const [sensorMode, setSensorMode] = useState('connected'); // 'connected' or 'manual'

  // Input Parameters
  const [cropType, setCropType] = useState('Wheat');
  const [growthStage, setGrowthStage] = useState('Crown Root Initiation (CRI)');
  const [soilType, setSoilType] = useState('Alluvial Loam');
  const [irrigationMethod, setIrrigationMethod] = useState('Drip Irrigation');
  const [landAcres, setLandAcres] = useState(5.0);

  // Results State
  const [scheduleData, setScheduleData] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedule();
    fetchSensorTelemetry();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/irrigation/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_type: cropType,
          growth_stage: growthStage,
          soil_type: soilType,
          irrigation_method: irrigationMethod,
          land_acres: parseFloat(landAcres) || 5.0
        })
      });
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
        await cacheData('irrigation_schedule', data);
      }
    } catch (e) {
      const cached = await getCachedData('irrigation_schedule');
      if (cached) setScheduleData(cached);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensorTelemetry = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/irrigation/sensor-data');
      if (res.ok) {
        const data = await res.json();
        setSensorData(data);
      }
    } catch (e) {
      setSensorData({
        device_id: 'AGRI-IOT-KRN-402',
        device_status: 'Offline Cached Mode',
        battery_pct: 90,
        telemetry: {
          soil_moisture_depth_15cm: 38.4,
          soil_moisture_depth_45cm: 46.2,
          soil_temperature_c: 19.8,
          electrical_conductivity_ds_m: 0.42,
          evapotranspiration_rate_mm: 3.6,
          water_status: 'Adequate Moisture (No Irrigation Needed for next 48h)'
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-brand-600 text-[32px]">water_drop</span>
          Smart Irrigation & Water Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
          Precision evapotranspiration scheduling, IoT soil moisture telemetry, and regional drought water-conservation alerts.
        </p>
      </div>

      {/* IoT Moisture Sensor Stream Card */}
      <div className="glass-card p-5 space-y-4 border-l-4 border-l-brand-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">Real-Time Soil Moisture Telemetry</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {sensorData?.device_id || 'AGRI-IOT-402'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">LoRaWAN 868MHz In-Field Sensor Node • Battery: {sensorData?.battery_pct || 92}%</p>
          </div>

          {/* Toggle between Connected Sensor and Manual Mode */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSensorMode('connected')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sensorMode === 'connected' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              📡 Connected IoT
            </button>
            <button
              onClick={() => setSensorMode('manual')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                sensorMode === 'manual' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              ✍️ Manual Entry
            </button>
          </div>
        </div>

        {/* Sensor Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Topsoil (15cm)</span>
            <span className="text-2xl font-extrabold text-brand-700">{sensorData?.telemetry.soil_moisture_depth_15cm || 38.4}%</span>
            <span className="text-[10px] text-slate-500 block">Volumetric Water</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rootzone (45cm)</span>
            <span className="text-2xl font-extrabold text-blue-700">{sensorData?.telemetry.soil_moisture_depth_45cm || 46.2}%</span>
            <span className="text-[10px] text-slate-500 block">Deep Moisture</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Soil Temp</span>
            <span className="text-2xl font-extrabold text-slate-800">{sensorData?.telemetry.soil_temperature_c || 19.8}°C</span>
            <span className="text-[10px] text-slate-500 block">Optimum Biological</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evapotranspiration</span>
            <span className="text-2xl font-extrabold text-amber-700">{sensorData?.telemetry.evapotranspiration_rate_mm || 3.6} mm</span>
            <span className="text-[10px] text-slate-500 block">Daily Crop Loss</span>
          </div>
        </div>

        {/* Status Advisory Banner */}
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>{sensorData?.telemetry.water_status}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
            Next Valve Open: In 3 Days
          </span>
        </div>
      </div>

      {/* Schedule Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 glass-card p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-600">tune</span>
            Irrigation Calculator Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Crop</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Wheat">Sharbati Wheat</option>
                <option value="Mustard">Mustard (Sarson)</option>
                <option value="Paddy">Basmati Paddy</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Phenological Growth Stage</label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Crown Root Initiation (CRI)">Crown Root Initiation (CRI) — 21 DAS</option>
                <option value="Tillering">Active Tillering — 45 DAS</option>
                <option value="Flowering">Flowering / Booting — 75 DAS</option>
                <option value="Milking">Milking / Grain Fill — 100 DAS</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Irrigation Delivery Method</label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Drip Irrigation">Micro-Drip Irrigation (55% Water Saving)</option>
                <option value="Sprinkler">Sprinkler System (35% Water Saving)</option>
                <option value="Flood / Furrow">Traditional Flood / Furrow</option>
              </select>
            </div>

            <button
              onClick={fetchSchedule}
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 mt-2"
            >
              {loading ? 'Recalculating...' : 'Generate Water Schedule'}
            </button>
          </div>
        </div>

        {/* Schedule Output */}
        <div className="lg:col-span-7 space-y-4">
          {scheduleData && (
            <div className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Valve Run</span>
                  <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">{scheduleData.recommended_flow_duration}</h4>
                  <p className="text-xs text-brand-700 font-bold mt-0.5">{scheduleData.water_savings}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Water Volume</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {scheduleData.next_irrigation_recommendation.water_volume_liters_per_acre.toLocaleString()} L/acre
                  </span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Critical Phenological Water Calendar
                </h5>
                <div className="space-y-2">
                  {scheduleData.critical_calendar.map((stage, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
                        stage.critical
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-slate-50 border-slate-100 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          {stage.critical && <span className="text-amber-600 font-bold text-xs">⚠️</span>}
                          <span className="font-bold">{stage.stage}</span>
                        </div>
                        <span className="text-[11px] opacity-75">{stage.priority}</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {stage.days_after_sowing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
