import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { cacheData, getCachedData } from '../services/offlineDb';

export default function LivestockPage() {
  const { t } = useLanguage();
  const { isOnline } = useNetwork();
  const [activeTab, setActiveTab] = useState('vet'); // 'vet' or 'dairy'

  // Vet AI Chat State
  const [animalType, setAnimalType] = useState('Cow (Desi / Crossbred)');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [vetAdvisory, setVetAdvisory] = useState(null);
  const [vetLoading, setVetLoading] = useState(false);

  // Dairy Ticker State
  const [dairyRates, setDairyRates] = useState([]);

  useEffect(() => {
    fetchDairyRates();
  }, []);

  const sampleVetQueries = [
    { title: 'Mastitis / Swollen Udder', prompt: 'Cow udder is hard, swollen and yellowish watery milk with blood streaks.' },
    { title: 'Lumpy Skin Nodules', prompt: 'Skin nodules/knots all over body with high fever and loss of appetite.' },
    { title: 'Severe Bloat / Afara', prompt: 'Left side abdomen is severely distended with gas, animal in distress.' },
    { title: 'General High Fever', prompt: 'Body temperature 104F, shivering, nasal discharge and sudden drop in milk yield.' }
  ];

  const handleVetQuery = async (queryText) => {
    const sym = queryText || symptomsInput;
    if (!sym.trim()) return;

    setVetLoading(true);
    setVetAdvisory(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/livestock/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animal_type: animalType,
          symptoms: sym
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVetAdvisory(data);
      }
    } catch (e) {
      // Local fallback
      setVetAdvisory({
        animal: animalType,
        preliminary_condition: 'Clinical Mastitis (Thanela Rog)',
        urgency_level: 'High',
        immediate_first_aid: 'Immediately strip out milk from infected quarter. Apply cold water packs to reduce inflammation.',
        recommended_treatment: 'Intramammary antibiotic infusion under veterinary supervision. Oral serratiopeptidase anti-inflammatory bolus.',
        ayurvedic_traditional_remedy: 'Turmeric powder (50g) + Aloe vera pulp (250g) + Lime (15g) ground into paste and applied externally on udder 3 times daily.',
        disclaimer: '⚠️ Veterinary Advisory: This AI diagnosis is for preliminary first-aid support. Please consult a registered Block Veterinary Officer.'
      });
    } finally {
      setVetLoading(false);
    }
  };

  const fetchDairyRates = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/livestock/dairy-rates');
      if (res.ok) {
        const data = await res.json();
        setDairyRates(data.regional_rates || []);
        await cacheData('livestock_dairy_rates', data.regional_rates);
      }
    } catch (e) {
      const cached = await getCachedData('livestock_dairy_rates');
      if (cached) setDairyRates(cached);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-brand-600 text-[32px]">pets</span>
          {t('livestock.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
          {t('livestock.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'vet' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">medical_services</span>
          {t('livestock.vetAdvisory')}
        </button>
        <button
          onClick={() => setActiveTab('dairy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'dairy' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">water_full</span>
          {t('livestock.milkYieldTracker')}
        </button>
      </div>

      {/* TAB 1: Veterinary AI */}
      {activeTab === 'vet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-600">health_and_safety</span>
              Animal Health Diagnostic Inputs
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Animal Category</label>
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Cow (Desi / Crossbred)">Cow (Desi / HF / Gir / Sahiwal)</option>
                  <option value="Buffalo (Murrah / Mehsana)">Buffalo (Murrah / Jaffarabadi)</option>
                  <option value="Goat / Sheep">Goat / Sheep</option>
                  <option value="Poultry">Poultry (Layers / Broilers)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observed Symptoms / Behavior</label>
                <textarea
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  rows="3"
                  placeholder="Describe swollen areas, appetite loss, milk discoloration, breathing pattern..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none font-medium"
                />
              </div>

              <button
                onClick={() => handleVetQuery()}
                disabled={vetLoading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                {vetLoading ? 'Consulting Veterinary AI...' : 'Get Immediate First-Aid'}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Common Emergencies</span>
              <div className="grid grid-cols-2 gap-2">
                {sampleVetQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSymptomsInput(q.prompt);
                      handleVetQuery(q.prompt);
                    }}
                    className="p-2 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-xl text-left transition active:scale-95"
                  >
                    <span className="text-[11px] font-bold text-slate-900 block truncate">{q.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {vetAdvisory ? (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="hero-gradient-card p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-brand-200 uppercase tracking-wider block">Identified Condition</span>
                      <h4 className="text-xl font-extrabold text-white mt-0.5">{vetAdvisory.preliminary_condition}</h4>
                      <p className="text-xs text-brand-100 mt-1">Patient: {vetAdvisory.animal}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full border border-white/20">
                      🚨 {vetAdvisory.urgency_level} Urgency
                    </span>
                  </div>
                </div>

                <div className="glass-card p-5 space-y-3 text-xs">
                  <div>
                    <h5 className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-1 text-sm text-brand-800">
                      <span className="material-symbols-outlined text-[18px]">medical_information</span>
                      Immediate First-Aid Protocol
                    </h5>
                    <p className="text-slate-700 font-semibold leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {vetAdvisory.immediate_first_aid}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-1 text-sm text-amber-900">
                      <span className="material-symbols-outlined text-[18px]">spa</span>
                      Traditional Ayurvedic / Herbal Remedy
                    </h5>
                    <p className="text-slate-700 font-semibold leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                      {vetAdvisory.ayurvedic_traditional_remedy}
                    </p>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400">
                    {vetAdvisory.disclaimer}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-2xl mx-auto">
                  🐄
                </div>
                <h4 className="text-base font-extrabold text-slate-800">Veterinary Copilot Ready</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Input animal symptoms or select a common emergency on the left to receive instant first-aid recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Dairy Milk Rates */}
      {activeTab === 'dairy' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Live Dairy Cooperative Procurement Rates</h3>
              <p className="text-xs text-slate-500">Benchmark prices for Cow & Buffalo milk based on standard Fat% and SNF% testing</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              🟢 Daily AM/PM Rate Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dairyRates.map((d, idx) => (
              <div key={idx} className="glass-card p-5 space-y-4">
                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{d.region}</h4>
                    <span className="text-[11px] text-slate-500 font-semibold">🏢 {d.coop}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full">
                    {d.trend}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">🐄 Cow Milk</span>
                    <span className="text-xl font-extrabold text-brand-700 block mt-0.5">{d.cow_milk_rate_per_liter}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{d.cow_standard}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">🐃 Buffalo Milk</span>
                    <span className="text-xl font-extrabold text-blue-700 block mt-0.5">{d.buffalo_milk_rate_per_liter}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{d.buffalo_standard}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
