import React, { useState, useEffect } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { cacheData, getCachedData } from '../services/offlineDb';

export default function FinancePage() {
  const { isOnline } = useNetwork();
  const [activeTab, setActiveTab] = useState('kcc'); // kcc, marketplace, literacy

  // KCC State
  const [landAcres, setLandAcres] = useState(8.0);
  const [primaryCrop, setPrimaryCrop] = useState('Wheat');
  const [irrigationStatus, setIrrigationStatus] = useState('Irrigated');
  const [existingLoan, setExistingLoan] = useState(0);
  const [kccResult, setKccResult] = useState(null);
  const [kccLoading, setKccLoading] = useState(false);

  // Marketplace & Tips State
  const [lenders, setLenders] = useState([]);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    calculateKcc();
    fetchLenders();
    fetchTips();
  }, []);

  const calculateKcc = async () => {
    setKccLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/finance/kcc-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          land_acres: parseFloat(landAcres),
          primary_crop: primaryCrop,
          irrigation_status: irrigationStatus,
          existing_loan_balance: parseFloat(existingLoan) || 0
        })
      });
      if (res.ok) {
        const data = await res.json();
        setKccResult(data.calculation);
      }
    } catch (e) {
      // Local fallback calculation
      const base = primaryCrop === 'Sugarcane' ? 65000 : primaryCrop === 'Cotton' ? 42000 : 36800;
      const cropComp = base * landAcres;
      const total = cropComp * 1.3;
      setKccResult({
        scale_of_finance_per_acre: base,
        crop_component: cropComp,
        post_harvest_consumption_10pct: cropComp * 0.1,
        asset_maintenance_20pct: cropComp * 0.2,
        first_year_eligible_limit: total,
        five_year_revolving_limit: total * 1.5,
        net_disbursable_limit: Math.max(0, total - existingLoan),
        interest_subvention_rate: '4.0% p.a. under Govt 3% Prompt Repayment Subsidy',
        collateral_requirement: 'Nil (Collateral-free KCC up to ₹1.60 Lakh)'
      });
    } finally {
      setKccLoading(false);
    }
  };

  const fetchLenders = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/finance/lenders');
      if (res.ok) {
        const data = await res.json();
        setLenders(data.lenders || []);
        await cacheData('finance_lenders', data.lenders);
      }
    } catch (e) {
      const cached = await getCachedData('finance_lenders');
      if (cached) setLenders(cached);
    }
  };

  const fetchTips = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/finance/literacy-tips');
      if (res.ok) {
        const data = await res.json();
        setTips(data.tips || []);
        await cacheData('finance_tips', data.tips);
      }
    } catch (e) {
      const cached = await getCachedData('finance_tips');
      if (cached) setTips(cached);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-brand-600 text-[32px]">credit_score</span>
          Credit & Financial Inclusion Hub
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
          Kisan Credit Card (KCC) limit estimator, institutional loan & microfinance marketplace, and anti-predatory borrowing guides.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'kcc', label: 'KCC Limit Estimator', icon: 'calculate' },
          { id: 'marketplace', label: 'Loan Comparison', icon: 'account_balance' },
          { id: 'literacy', label: 'Financial Literacy Tips', icon: 'lightbulb' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: KCC Calculator */}
      {activeTab === 'kcc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-600">tune</span>
              Scale of Finance Calculator Inputs
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Farm Land (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={landAcres}
                  onChange={(e) => setLandAcres(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Cultivation Crop</label>
                <select
                  value={primaryCrop}
                  onChange={(e) => setPrimaryCrop(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Wheat">Wheat (Sharbati / Dara)</option>
                  <option value="Paddy">Basmati / Paddy</option>
                  <option value="Mustard">Mustard (Oilseed)</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cotton">Bt Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Irrigation Availability</label>
                <select
                  value={irrigationStatus}
                  onChange={(e) => setIrrigationStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Irrigated">100% Assured Irrigation (Canal / Tube-well)</option>
                  <option value="Rainfed">Rainfed / Semi-Arid</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Existing Outstanding Loans (₹)</label>
                <input
                  type="number"
                  value={existingLoan}
                  onChange={(e) => setExistingLoan(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <button
                onClick={calculateKcc}
                disabled={kccLoading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 mt-2"
              >
                {kccLoading ? 'Calculating Scale...' : 'Calculate KCC Limit'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {kccResult && (
              <div className="space-y-4">
                <div className="hero-gradient-card p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-brand-200 uppercase tracking-wider block">
                        Eligible KCC Limit (Year 1)
                      </span>
                      <h4 className="text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
                        ₹{kccResult.first_year_eligible_limit.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-xs text-brand-100 mt-1">
                        5-Year Revolving Limit: <strong>₹{kccResult.five_year_revolving_limit.toLocaleString('en-IN')}</strong>
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                      4.0% Subsidized ROI
                    </span>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-black/20 p-2.5 rounded-xl">
                      <span className="text-[10px] text-brand-200 block">Crop Component</span>
                      <span className="font-bold text-white">₹{kccResult.crop_component.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-xl">
                      <span className="text-[10px] text-brand-200 block">Household (10%)</span>
                      <span className="font-bold text-white">₹{kccResult.post_harvest_consumption_10pct.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-brand-200 block">Asset Repairs (20%)</span>
                      <span className="font-bold text-white">₹{kccResult.asset_maintenance_20pct.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
                    <span>{kccResult.interest_subvention_rate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">security</span>
                    <span>{kccResult.collateral_requirement}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Loan Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lenders.map((l) => (
            <div key={l.id} className="glass-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">{l.institution}</span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{l.product}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800">
                    {l.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                    <span className="font-extrabold text-brand-700">{l.interest_rate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Max Limit</span>
                    <span className="font-extrabold text-slate-900">{l.max_amount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tenure</span>
                    <span className="font-semibold text-slate-700">{l.tenure}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Processing Fee</span>
                    <span className="font-semibold text-slate-700">{l.processing_fee}</span>
                  </div>
                </div>

                <ul className="space-y-1 text-[11px] text-slate-600">
                  {l.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-brand-600">check_circle</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95">
                Apply via JanSamarth Portal ↗
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Financial Literacy Tips */}
      {activeTab === 'literacy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((t) => (
            <div key={t.id} className="glass-card p-5 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">{t.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                {t.category}
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">{t.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
