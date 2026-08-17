import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationSettingsModal() {
  const { settings, updateSettings, isSettingsOpen, setIsSettingsOpen, triggerSimulation } = useNotifications();
  const [formState, setFormState] = useState({ ...settings });
  const [simulating, setSimulating] = useState(false);

  if (!isSettingsOpen) return null;

  const availableCrops = [
    { id: 'wheat', label: 'Wheat (गेहूं)' },
    { id: 'paddy', label: 'Basmati Paddy (धान)' },
    { id: 'mustard', label: 'Mustard (सरसों)' },
    { id: 'soybean', label: 'Soybean (सोयाबीन)' },
    { id: 'cotton', label: 'Bt Cotton (कपास)' },
    { id: 'maize', label: 'Maize (मक्का)' },
    { id: 'onion', label: 'Onion (प्याज)' },
    { id: 'tomato', label: 'Tomato (टमाटर)' }
  ];

  const handleToggleCrop = (cropId) => {
    const list = formState.watchlist_crops || [];
    if (list.includes(cropId)) {
      setFormState({ ...formState, watchlist_crops: list.filter((c) => c !== cropId) });
    } else {
      setFormState({ ...formState, watchlist_crops: [...list, cropId] });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formState);
    setIsSettingsOpen(false);
  };

  const handleTestTrigger = async (type) => {
    setSimulating(true);
    await triggerSimulation(type);
    setSimulating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-floating border border-[#e7e5e4] animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#f5f2eb] mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#14532d] text-white flex items-center justify-center text-base">
              ⚙️
            </span>
            <div>
              <h3 className="font-extrabold text-base text-[#1c1917] font-editorial">
                अलर्ट प्राथमिकताएं • Notification Preferences
              </h3>
              <p className="text-[11px] text-[#78716c]">Customise weather and mandi price alert thresholds</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 text-[#78716c] hover:text-[#1c1917]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-medium text-[#44403c]">
          {/* Category Switches */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-extrabold text-[#a8a29e] uppercase tracking-wider block">
              Active Alert Channels
            </span>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] cursor-pointer hover:bg-[#f5f2eb]">
              <div>
                <span className="font-bold text-[#1c1917] block">🌦️ Weather & Rain Alerts</span>
                <span className="text-[11px] text-[#78716c]">Alert when rain & heatwave exceed safety limits</span>
              </div>
              <input
                type="checkbox"
                checked={formState.enable_weather_alerts}
                onChange={(e) => setFormState({ ...formState, enable_weather_alerts: e.target.checked })}
                className="w-4 h-4 accent-[#14532d] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] cursor-pointer hover:bg-[#f5f2eb]">
              <div>
                <span className="font-bold text-[#1c1917] block">📈 Mandi Price Volatility Alerts</span>
                <span className="text-[11px] text-[#78716c]">Alert on sudden spot spikes or MSP divergences</span>
              </div>
              <input
                type="checkbox"
                checked={formState.enable_price_alerts}
                onChange={(e) => setFormState({ ...formState, enable_price_alerts: e.target.checked })}
                className="w-4 h-4 accent-[#14532d] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] cursor-pointer hover:bg-[#f5f2eb]">
              <div>
                <span className="font-bold text-[#1c1917] block">🏛️ PM-KISAN & PMFBY Scheme Deadlines</span>
                <span className="text-[11px] text-[#78716c]">Direct benefit release & claim intimation alerts</span>
              </div>
              <input
                type="checkbox"
                checked={formState.enable_scheme_alerts}
                onChange={(e) => setFormState({ ...formState, enable_scheme_alerts: e.target.checked })}
                className="w-4 h-4 accent-[#14532d] rounded"
              />
            </label>
          </div>

          {/* Threshold Sliders */}
          <div className="space-y-3 pt-2 border-t border-[#f5f2eb]">
            <span className="text-[10px] font-extrabold text-[#a8a29e] uppercase tracking-wider block">
              Custom Thresholds
            </span>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Rainfall Probability Threshold</span>
                <span className="font-extrabold text-[#14532d]">{formState.rain_probability_threshold}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={formState.rain_probability_threshold}
                onChange={(e) => setFormState({ ...formState, rain_probability_threshold: Number(e.target.value) })}
                className="w-full accent-[#14532d]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Price Movement Threshold (±%)</span>
                <span className="font-extrabold text-[#14532d]">±{formState.price_change_threshold}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={formState.price_change_threshold}
                onChange={(e) => setFormState({ ...formState, price_change_threshold: Number(e.target.value) })}
                className="w-full accent-[#14532d]"
              />
            </div>
          </div>

          {/* Watchlist Crops */}
          <div className="space-y-2 pt-2 border-t border-[#f5f2eb]">
            <span className="text-[10px] font-extrabold text-[#a8a29e] uppercase tracking-wider block">
              Tracked Crops Watchlist
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableCrops.map((c) => {
                const isSelected = (formState.watchlist_crops || []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleToggleCrop(c.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#14532d] text-white shadow-2xs'
                        : 'bg-[#f5f2eb] text-[#78716c] hover:bg-[#e7e5e4]'
                    }`}
                  >
                    <span>{c.label}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Simulation Buttons */}
          <div className="pt-2 border-t border-[#f5f2eb] bg-[#faf8f5] p-3 rounded-2xl">
            <span className="text-[10px] font-extrabold text-[#78716c] uppercase block mb-1.5">
              🧪 Test Live Auto-Alert Pipeline
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTestTrigger('weather')}
                disabled={simulating}
                className="px-3 py-1.5 bg-white border border-[#e7e5e4] hover:bg-[#f5f2eb] rounded-xl text-[11px] font-bold text-[#ea580c] transition active:scale-98"
              >
                Simulate Rain Spike (&gt;70%)
              </button>
              <button
                type="button"
                onClick={() => handleTestTrigger('price')}
                disabled={simulating}
                className="px-3 py-1.5 bg-white border border-[#e7e5e4] hover:bg-[#f5f2eb] rounded-xl text-[11px] font-bold text-[#16a34a] transition active:scale-98"
              >
                Simulate Wheat Surge (+6%)
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 font-bold text-[#78716c] hover:bg-[#f5f2eb] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-extrabold text-white bg-[#14532d] hover:bg-[#052e16] rounded-xl shadow-xs transition btn-tap"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
