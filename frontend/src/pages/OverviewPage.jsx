import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useBackNavigation } from '../context/BackNavigationContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function OverviewPage() {
  const { user, role } = useAuth();
  const { t, formatCurrency, formatDate } = useLanguage();
  const { registerOverlay, unregisterOverlay } = useBackNavigation();
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [activeTab, setActiveTab] = useState('1M');
  const [priceSource, setPriceSource] = useState('agripulse'); // 'agripulse' or 'enam'
  const [enamPrices, setEnamPrices] = useState([]);

  const [fieldNotes, setFieldNotes] = useState([
    { id: 1, text: 'Karnal APMC: Heavy arrival pressure expected from Friday. Consider listing on B2B Escrow.', done: true, tag: 'Mandi' },
    { id: 2, text: 'Crown Root Initiation (CRI) 1st irrigation due on North Parcel (6.2 Acres).', done: false, tag: 'Irrigation' },
    { id: 3, text: 'ITC Agri-Business verified buyer bid of ₹2,860/qtl on Sharbati Wheat.', done: false, tag: 'B2B Trade' }
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Register Note Modal with Back Navigation
  useEffect(() => {
    if (showNoteModal) {
      registerOverlay('overviewNoteModal', () => setShowNoteModal(false));
    } else {
      unregisterOverlay('overviewNoteModal');
    }
    return () => unregisterOverlay('overviewNoteModal');
  }, [showNoteModal, registerOverlay, unregisterOverlay]);

  useEffect(() => {
    fetchEnamPrices();
  }, []);

  const fetchEnamPrices = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/markets/enam');
      if (res.ok) {
        const data = await res.json();
        setEnamPrices(data.data || []);
      }
    } catch (e) {
      console.warn('e-NAM fetch fallback:', e);
    }
  };

  const commodities = [
    { id: 'wheat', name: 'Sharbati Wheat', hindi: 'गेहूं (शरबती)', price: '₹2,840', change: '+2.4%', msp: '₹2,425', arrivals: '480 MT', moisture: '11.2%', status: 'Active Demand' },
    { id: 'rice', name: 'Basmati Paddy', hindi: 'बासमती धान', price: '₹3,950', change: '-0.8%', msp: '₹2,320', arrivals: '620 MT', moisture: '12.5%', status: 'Export Buying' },
    { id: 'mustard', name: 'Mustard (Black)', hindi: 'सरसों (काली)', price: '₹5,780', change: '+1.2%', msp: '₹5,950', arrivals: '340 MT', moisture: '8.4%', status: 'Oil Mill Inquiries' },
    { id: 'soybean', name: 'Soybean (Yellow)', hindi: 'सोयाबीन', price: '₹4,890', change: '+1.7%', msp: '₹4,892', arrivals: '890 MT', moisture: '10.0%', status: 'Firm Processing' },
    { id: 'cotton', name: 'Bt Cotton (Long)', hindi: 'कपास', price: '₹7,420', change: '+3.1%', msp: '₹7,121', arrivals: '210 MT', moisture: '9.0%', status: 'Spinning Mill Rush' }
  ];

  const currentCommodity = commodities.find((c) => c.id === selectedCrop) || commodities[0];

  const chartLabels = ['01 Oct', '06 Oct', '11 Oct', '16 Oct', '21 Oct', '26 Oct', '31 Oct'];
  const chartPrices = selectedCrop === 'wheat'
    ? [2710, 2745, 2790, 2760, 2810, 2835, 2840]
    : selectedCrop === 'rice'
    ? [3980, 3960, 3990, 3940, 3920, 3945, 3950]
    : selectedCrop === 'mustard'
    ? [5650, 5680, 5710, 5700, 5740, 5760, 5780]
    : selectedCrop === 'soybean'
    ? [4720, 4760, 4810, 4790, 4850, 4870, 4890]
    : [7200, 7250, 7310, 7290, 7360, 7390, 7420];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${currentCommodity.name} Spot Price`,
        data: chartPrices,
        borderColor: '#14532d',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, 'rgba(20, 83, 45, 0.16)');
          gradient.addColorStop(1, 'rgba(20, 83, 45, 0.0)');
          return gradient;
        },
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#14532d',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
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
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Spot Mandi Price: ₹${context.raw}/qtl`
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
          callback: (val) => `₹${val}`
        }
      }
    }
  };

  const toggleNote = (id) => {
    setFieldNotes(fieldNotes.map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
  };

  const addNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setFieldNotes([...fieldNotes, { id: Date.now(), text: newNoteText.trim(), done: false, tag: 'Field Task' }]);
    setNewNoteText('');
    setShowNoteModal(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Editorial Farm Briefing Banner */}
      <div className="hero-gradient-card p-5 sm:p-7 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-emerald-100 border border-white/20 uppercase tracking-wider">
                🌾 Seasonal Realization Briefing
              </span>
              <span className="text-xs text-emerald-200">Karnal APMC District Node #489</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight font-editorial leading-tight">
              ₹12,45,800 <span className="text-sm sm:text-base font-sans font-normal text-emerald-200">Estimated Harvest Revenue</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Your direct-trade realization is trending <strong>+₹140/qtl (+5.2%) above local APMC mandi average</strong>, backed by verified institutional escrow bids from ITC & Adani Wilmar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5 w-full md:w-auto">
            <button
              onClick={() => navigate('/crop-planning')}
              className="flex-1 md:flex-none px-3.5 sm:px-4 py-2.5 bg-[#ffffff] text-[#14532d] hover:bg-[#f5f2eb] text-xs font-bold rounded-xl shadow-xs transition btn-tap flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Crop Planning AI
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 md:flex-none px-3.5 sm:px-4 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold rounded-xl shadow-xs transition btn-tap flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              B2B Trading Floor
            </button>
          </div>
        </div>
      </div>

      {/* Mandi Price Strip with e-NAM Government Toggle */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
          <div>
            <h2 className="font-extrabold text-[#1c1917] flex items-center gap-2 font-editorial text-sm sm:text-base">
              <span>दैनिक मंडी भाव • Live Mandi Spot Benchmarks</span>
            </h2>
            <p className="text-[11px] text-[#78716c]">Live arrivals and modal spot rates across 14 Haryana & Punjab APMCs</p>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center bg-[#f5f2eb] p-1 rounded-xl text-xs font-bold border border-[#e7e5e4] w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setPriceSource('agripulse')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition text-center ${
                priceSource === 'agripulse' ? 'bg-white text-[#14532d] shadow-2xs' : 'text-[#78716c]'
              }`}
            >
              🌾 Direct Network
            </button>
            <button
              onClick={() => setPriceSource('enam')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition text-center ${
                priceSource === 'enam' ? 'bg-white text-[#14532d] shadow-2xs' : 'text-[#78716c]'
              }`}
            >
              🏛️ e-NAM Official
            </button>
          </div>
        </div>

        {priceSource === 'agripulse' ? (
          /* Responsive: Smooth Horizontal Scroll on Mobile (<640px) and Clean Grid on Tablet/Desktop */
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {commodities.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCrop(c.id)}
                className={`paper-card p-3 sm:p-3.5 cursor-pointer transition shrink-0 w-[240px] sm:w-auto ${
                  selectedCrop === c.id
                    ? 'border-2 border-[#14532d] bg-[#f5fdf7] shadow-sm'
                    : 'hover:border-[#d6d3d1]'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="min-w-0 pr-1">
                    <span className="text-xs font-extrabold text-[#1c1917] block truncate">{c.name}</span>
                    <span className="text-[10px] text-[#78716c] truncate block">{c.hindi}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                      c.change.startsWith('+') ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {c.change}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-[#1c1917] mt-1">
                  {c.price} <span className="text-[10px] font-normal text-[#78716c]">/qtl</span>
                </div>
                <div className="pt-2 mt-2 border-t border-[#f5f2eb] flex justify-between items-center text-[10px] text-[#78716c]">
                  <span className="truncate">MSP: {c.msp}</span>
                  <span className="font-bold text-[#14532d] truncate ml-1">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enamPrices.map((item, idx) => (
              <div key={idx} className="paper-card p-4 border-l-4 border-l-[#14532d] space-y-1 text-xs">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-extrabold text-[#1c1917] truncate">{item.commodity} ({item.variety})</h4>
                    <span className="text-[11px] text-[#78716c] truncate block">🏛️ {item.mandi_name}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-full shrink-0">
                    e-NAM
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <span className="text-[10px] text-[#78716c] block">Modal Spot Rate</span>
                    <span className="text-base font-extrabold text-[#1c1917]">₹{item.modal_price}/qtl</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#78716c] block">Govt MSP Reference</span>
                    <span className="text-xs font-bold text-emerald-800">₹{item.msp_benchmark}/qtl</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Human-Crafted Farmer Operations & Tools Grid (4 -> 2 -> 1 Responsive Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-extrabold text-[#1c1917] uppercase tracking-wider font-editorial text-xs sm:text-sm">
            कृषि सुविधाएं • Farmer Operations & Tools
          </span>
          <span className="text-[11px] text-[#78716c] hidden sm:inline">8 Practical Agronomy Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { title: 'Govt Schemes', sub: 'PM-KISAN & फसल बीमा', icon: 'account_balance', route: '/schemes', tag: 'DBT Active' },
            { title: 'KCC Loans', sub: '4% ब्याज दर पर ऋण', icon: 'credit_score', route: '/finance', tag: 'NABARD Scale' },
            { title: 'Payment Vault', sub: 'सुरक्षित एस्क्रो भुगतान', icon: 'payments', route: '/payment', tag: 'RBI Compliant' },
            { title: 'Crop Doctor', sub: 'फोटो खींचकर रोग पहचान', icon: 'photo_camera', route: '/diagnose', tag: 'ICAR Dosage' },
            { title: 'Smart Irrigation', sub: 'सिंचाई समय व IoT सेंसर', icon: 'water_drop', route: '/irrigation', tag: 'Water Saver' },
            { title: 'Farm Rentals', sub: 'ट्रैक्टर, कंबाइन व मजदूर', icon: 'agriculture', route: '/rentals', tag: 'Sharing Hub' },
            { title: 'Crop Almanac', sub: 'बुवाई से कटाई पंचांग', icon: 'calendar_month', route: '/calendar', tag: 'Push Alerts' },
            { title: 'Farmer Forum', sub: 'किसान चौपाल व अनुभव', icon: 'groups', route: '/community', tag: 'Peer Advice' }
          ].map((tile, idx) => (
            <button
              key={idx}
              onClick={() => navigate(tile.route)}
              className="paper-card p-3 sm:p-4 text-left hover:border-[#b45309] transition btn-tap flex flex-col justify-between space-y-2.5 sm:space-y-3 group min-w-0"
            >
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#faf8f5] border border-[#e7e5e4] text-[#14532d] flex items-center justify-center group-hover:bg-[#14532d] group-hover:text-white transition shrink-0">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">{tile.icon}</span>
                </div>
                <span className="text-[9px] font-bold text-[#78716c] bg-[#f5f2eb] px-1.5 py-0.5 rounded-md truncate max-w-[80px]">
                  {tile.tag}
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-[#1c1917] group-hover:text-[#14532d] transition truncate">{tile.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-[#78716c] font-medium mt-0.5 truncate">{tile.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Grid: Price Trend Chart & Field Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Spot Price Trend Chart */}
        <div className="lg:col-span-8 paper-card p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#f5f2eb]">
            <div>
              <h3 className="font-extrabold text-[#1c1917] flex items-center gap-2 font-editorial text-sm sm:text-base">
                <span>{currentCommodity.name} • 30-Day Spot Price</span>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full font-sans">
                  {currentCommodity.change}
                </span>
              </h3>
              <p className="text-[11px] text-[#78716c]">Weighted average realized spot prices across North India APMCs</p>
            </div>

            <div className="flex gap-1 bg-[#f5f2eb] p-1 rounded-xl text-xs font-bold self-end sm:self-auto">
              {['7D', '1M', '3M', '1Y'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTab === t ? 'bg-white text-[#1c1917] shadow-2xs' : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-60 sm:h-72 lg:h-80 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Tactile Farmer Field Task Notebook */}
        <div className="lg:col-span-4 paper-card p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-[#f5f2eb]">
              <h3 className="font-extrabold text-[#1c1917] flex items-center gap-1.5 font-editorial text-sm sm:text-base">
                <span className="material-symbols-outlined text-[#14532d] text-[18px]">checklist</span>
                खेत डायरी • Field Tasks
              </h3>
              <button
                onClick={() => setShowNoteModal(true)}
                className="text-[11px] font-bold text-[#b45309] hover:text-[#92400e]"
              >
                + Add Note
              </button>
            </div>

            <div className="space-y-2 mt-3">
              {fieldNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => toggleNote(note.id)}
                  className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl hover:bg-[#faf8f5] cursor-pointer text-xs font-medium text-[#44403c] transition border border-transparent hover:border-[#e7e5e4]"
                >
                  <input
                    type="checkbox"
                    checked={note.done}
                    readOnly
                    className="mt-0.5 rounded accent-[#14532d] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`block break-words ${note.done ? 'line-through text-[#a8a29e]' : 'text-[#1c1917]'}`}>
                      {note.text}
                    </span>
                    <span className="block text-[10px] text-[#a8a29e] mt-0.5">Category: {note.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/calendar')}
            className="w-full py-2.5 bg-[#f5f2eb] hover:bg-[#e7e5e4] text-[#1c1917] text-xs font-bold rounded-xl transition mt-3"
          >
            Open Complete Sowing Almanac ➔
          </button>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-floating border border-[#e7e5e4] animate-in zoom-in-95">
            <h4 className="text-sm font-extrabold text-[#1c1917] mb-2 font-editorial">Add Field Task Note</h4>
            <form onSubmit={addNote} className="space-y-3 text-xs">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="e.g. Schedule nitrogen fertilizer spray before rain..."
                rows="3"
                className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl resize-none font-medium focus:outline-[#14532d]"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 font-bold text-[#78716c] hover:bg-[#f5f2eb] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-[#14532d] hover:bg-[#052e16] rounded-xl shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
