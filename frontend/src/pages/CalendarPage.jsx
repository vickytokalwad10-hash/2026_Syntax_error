import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { cacheData, getCachedData } from '../services/offlineDb';

export default function CalendarPage() {
  const { t } = useLanguage();
  const { isOnline } = useNetwork();
  const [cropName, setCropName] = useState('Sharbati Wheat');
  const [region, setRegion] = useState('Haryana / Punjab');
  const [soilType, setSoilType] = useState('Alluvial Loam');
  const [sowingDate, setSowingDate] = useState('2025-11-15');

  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    generateCalendar();
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationEnabled(true);
    }
  }, []);

  const generateCalendar = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/calendar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_name: cropName,
          region,
          soil_type: soilType,
          sowing_date: sowingDate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data);
        await cacheData('crop_calendar', data);
      }
    } catch (e) {
      const cached = await getCachedData('crop_calendar');
      if (cached) setCalendarData(cached);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setToast('⚠️ Browser Notifications not supported on this device.');
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationEnabled(true);
      new Notification('AgriPulse Almanac Alerts Enabled 🌱', {
        body: 'You will receive timely alerts for critical irrigation, fertilizer doses, and harvest windows.',
        icon: '/favicon.ico'
      });
      setToast('✅ Sowing milestone push notifications activated!');
      setTimeout(() => setToast(null), 4000);
    } else {
      setToast('Notification permission was denied.');
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-brand-600 text-white px-4 py-3 rounded-2xl shadow-floating flex items-center justify-between text-xs font-bold animate-in zoom-in-95">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-brand-600 text-[32px]">calendar_month</span>
            {t('calendar.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
            {t('calendar.subtitle')}
          </p>
        </div>

        <button
          onClick={requestNotificationPermission}
          className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 ${
            notificationEnabled
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-brand-600 hover:bg-brand-700 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {notificationEnabled ? 'notifications_active' : 'notifications'}
          </span>
          {notificationEnabled ? 'Alerts Active' : 'Enable Milestone Push Alerts'}
        </button>
      </div>

      {/* Inputs Strip */}
      <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Crop</label>
          <select
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
          >
            <option value="Sharbati Wheat">Sharbati Wheat</option>
            <option value="Basmati Rice">Basmati Rice</option>
            <option value="Mustard">Mustard (Sarson)</option>
            <option value="Soybean">Soybean</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Agro-Climatic Zone</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
          >
            <option value="Haryana / Punjab">Haryana / Punjab (Indo-Gangetic)</option>
            <option value="Maharashtra">Maharashtra (Deccan Plateau)</option>
            <option value="Madhya Pradesh">Madhya Pradesh (Central)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Sowing Date</label>
          <input
            type="date"
            value={sowingDate}
            onChange={(e) => setSowingDate(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={generateCalendar}
            disabled={loading}
            className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95"
          >
            {loading ? 'Recalculating...' : 'Regenerate Almanac'}
          </button>
        </div>
      </div>

      {/* Calendar Summary Hero */}
      {calendarData && (
        <div className="space-y-4">
          <div className="hero-gradient-card p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[11px] font-bold text-brand-200 uppercase tracking-wider block">Seasonal Almanac</span>
                <h4 className="text-xl font-extrabold text-white">{calendarData.crop} • {calendarData.total_crop_duration_days} Days Cycle</h4>
                <p className="text-xs text-brand-100 mt-0.5">
                  Sown: <strong>{calendarData.sowing_date}</strong> ➔ Expected Harvest: <strong>{calendarData.expected_harvest_date}</strong>
                </p>
              </div>

              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold border border-white/30">
                📍 {calendarData.region}
              </span>
            </div>
          </div>

          {/* Vertical Timeline / Almanac */}
          <div className="space-y-3">
            {calendarData.milestones.map((m, idx) => (
              <div
                key={idx}
                className={`glass-card p-4 transition ${
                  m.status === 'Current Stage'
                    ? 'border-2 border-brand-500 shadow-md bg-brand-50/20'
                    : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-600 text-[20px]">{m.icon}</span>
                    <h5 className="text-sm font-extrabold text-slate-900">{m.phase}</h5>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {m.day_range}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">📅 {m.date}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600'
                          : m.status === 'Current Stage'
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 text-xs text-slate-700 font-medium">
                  <p>{m.activity}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-brand-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">alarm</span>
                    Notification Alert: "{m.notification_prompt}"
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
