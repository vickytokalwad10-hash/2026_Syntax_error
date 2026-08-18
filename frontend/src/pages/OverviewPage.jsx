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
  const [priceSource, setPriceSource] = useState('agripulse'); // 'agripulse' | 'agmarknet' | 'enam'
  const [enamPrices, setEnamPrices] = useState([]);
  const [coverageSummary, setCoverageSummary] = useState('');
  const [govtAttribution, setGovtAttribution] = useState('Source: Agmarknet, Ministry of Agriculture & Farmers Welfare, Government of India (via data.gov.in)');

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
    if (priceSource !== 'agripulse') {
      fetchGovtPrices(priceSource);
    }
  }, [priceSource]);

  const fetchGovtPrices = async (source = 'all') => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/markets/agmarknet?source=${source}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setEnamPrices(data.records || []);
        if (data.coverage_summary) {
          setCoverageSummary(data.coverage_summary);
        }
        if (data.attribution) {
          const attr = typeof data.attribution === 'string' ? data.attribution : (data.attribution[source] || data.attribution.agmarknet);
          setGovtAttribution(attr);
        }
      }
    } catch (e) {
      console.warn('Government mandi data fetch note:', e);
    }
  };

  const commodities = [
    {
      id: 'wheat',
      name: t('overview.cropWheat') || 'Sharbati Wheat',
      sub: 'Triticum aestivum',
      price: '₹2,840',
      change: '+2.4%',
      msp: '₹2,425',
      arrivals: '480 MT',
      moisture: '11.2%',
      status: t('overview.statusActiveDemand') || 'Active Demand'
    },
    {
      id: 'rice',
      name: t('overview.cropRice') || 'Basmati Paddy',
      sub: 'Oryza sativa (1121)',
      price: '₹3,950',
      change: '-0.8%',
      msp: '₹2,320',
      arrivals: '620 MT',
      moisture: '12.5%',
      status: t('overview.statusExportBuying') || 'Export Buying'
    },
    {
      id: 'mustard',
      name: t('overview.cropMustard') || 'Mustard (Black)',
      sub: 'Brassica nigra',
      price: '₹5,780',
      change: '+1.2%',
      msp: '₹5,950',
      arrivals: '340 MT',
      moisture: '8.4%',
      status: t('overview.statusOilMill') || 'Oil Mill Inquiries'
    },
    {
      id: 'soybean',
      name: t('overview.cropSoybean') || 'Soybean (Yellow)',
      sub: 'Glycine max',
      price: '₹4,890',
      change: '+1.7%',
      msp: '₹4,892',
      arrivals: '890 MT',
      moisture: '10.0%',
      status: t('overview.statusFirmProcessing') || 'Firm Processing'
    },
    {
      id: 'cotton',
      name: t('overview.cropCotton') || 'Bt Cotton (Long)',
      sub: 'Gossypium hirsutum',
      price: '₹7,420',
      change: '+3.1%',
      msp: '₹7,121',
      arrivals: '210 MT',
      moisture: '9.0%',
      status: t('overview.statusSpinningMill') || 'Spinning Mill Rush'
    }
  ];

  const currentCommodity = commodities.find((c) => c.id === selectedCrop) || commodities[0];

  const getTimeframeData = () => {
    const baseMap = {
      wheat: 2840,
      rice: 3950,
      mustard: 5780,
      soybean: 4890,
      cotton: 7420
    };
    const base = baseMap[selectedCrop] || 2840;

    if (activeTab === '7D') {
      return {
        labels: ['12 Aug', '13 Aug', '14 Aug', '15 Aug', '16 Aug', '17 Aug', '18 Aug'],
        prices: [base - 45, base - 25, base - 60, base - 15, base + 10, base - 5, base]
      };
    } else if (activeTab === '1M') {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        prices: [base - 120, base - 80, base - 35, base]
      };
    } else if (activeTab === '3M') {
      return {
        labels: ['Jun 2026', 'Jul 2026', 'Aug 2026'],
        prices: [base - 210, base - 95, base]
      };
    } else {
      return {
        labels: ['Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
        prices: [base - 380, base - 260, base - 140, base - 40, base]
      };
    }
  };

  const { labels: chartLabels, prices: chartPrices } = getTimeframeData();

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${currentCommodity.name} ${t('overview.spotPrice') || 'Spot Price'}`,
        data: chartPrices,
        borderColor: '#14532d',
        backgroundColor: (context) => {
          const ctx = context.chart?.ctx;
          if (!ctx) return 'rgba(20, 83, 45, 0.1)';
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
          label: (context) => `${t('overview.spotPrice') || 'Spot Price'}: ₹${context.raw}/qtl`
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
                🌾 {t('overview.seasonalBriefingBadge') || 'मौसमी आय विश्लेषण'}
              </span>
              <span className="text-xs text-emerald-200">
                {t('overview.districtNodeLabel') || 'करनाल एपीएमसी जिला नोड #489'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight font-editorial leading-tight">
              ₹12,45,800 <span className="text-sm sm:text-base font-sans font-normal text-emerald-200">{t('overview.estimatedRevenue') || 'अनुमानित फसल आय'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {t('overview.briefingDescription') || 'आपका सीधा व्यापार भाव स्थानीय एपीएमसी मंडी औसत से +₹140/क्विंटल (+5.2%) अधिक है, जो आईटीसी और अडानी विल्मर की सुरक्षित एस्क्रो बोलियों से समर्थित है।'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5 w-full md:w-auto">
            <button
              onClick={() => navigate('/crop-planning')}
              className="flex-1 md:flex-none px-3.5 sm:px-4 py-2.5 bg-[#ffffff] text-[#14532d] hover:bg-[#f5f2eb] text-xs font-bold rounded-xl shadow-xs transition btn-tap flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              {t('overview.cropPlanningAi') || 'फसल योजना AI'}
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 md:flex-none px-3.5 sm:px-4 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold rounded-xl shadow-xs transition btn-tap flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              {t('overview.b2bTradingFloor') || 'सीधा व्यापार मंडी'}
            </button>
          </div>
        </div>
      </div>

      {/* Mandi Price Strip with Multi-Source Government & e-NAM Toggle */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
          <div>
            <h2 className="font-extrabold text-[#1c1917] flex items-center gap-2 font-editorial text-sm sm:text-base">
              <span className="material-symbols-outlined text-[#14532d] text-[20px]">storefront</span>
              <span>
                {t('overview.liveMandiPrices')} • {
                  priceSource === 'agripulse'
                    ? t('overview.priceSourceAgriPulse')
                    : priceSource === 'enam'
                    ? t('overview.priceSourceEnam')
                    : t('overview.priceSourceGovt')
                }
              </span>
            </h2>
            <p className="text-[11px] text-[#78716c]">
              {priceSource === 'agripulse'
                ? (t('overview.realTimeFeedSubtitle') || 'उत्तर भारत के प्रमुख कृषि केंद्रों पर एफपीओ व एपीएमसी का सीधा व्यापार')
                : priceSource === 'enam'
                ? t('overview.enamAttribution')
                : t('overview.govtAttribution')}
            </p>
          </div>

          {/* 3-Way Source Toggle */}
          <div className="flex items-center bg-[#f5f2eb] p-1 rounded-xl text-xs font-bold border border-[#e7e5e4] w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setPriceSource('agripulse')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition whitespace-nowrap text-center ${
                priceSource === 'agripulse' ? 'bg-white text-[#14532d] shadow-2xs font-extrabold' : 'text-[#78716c]'
              }`}
            >
              🌾 {t('overview.priceSourceAgriPulse')}
            </button>
            <button
              onClick={() => setPriceSource('agmarknet')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition whitespace-nowrap text-center ${
                priceSource === 'agmarknet' ? 'bg-white text-[#14532d] shadow-2xs font-extrabold' : 'text-[#78716c]'
              }`}
            >
              🏛️ {t('overview.priceSourceGovt')}
            </button>
            <button
              onClick={() => setPriceSource('enam')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg transition whitespace-nowrap text-center ${
                priceSource === 'enam' ? 'bg-white text-[#14532d] shadow-2xs font-extrabold' : 'text-[#78716c]'
              }`}
            >
              📊 {t('overview.priceSourceEnam')}
            </button>
          </div>
        </div>

        {coverageSummary && priceSource !== 'agripulse' && (
          <div className="px-1 text-[11px] font-semibold text-[#15803d] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
            <span>{coverageSummary}</span>
          </div>
        )}

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
                    <span className="text-[10px] text-[#78716c] truncate block">{c.sub}</span>
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
                  <span className="truncate">{t('overview.msp') || 'MSP'}: {c.msp}</span>
                  <span className="font-bold text-[#14532d] truncate ml-1">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {enamPrices.map((item, idx) => (
                <div key={idx} className="paper-card p-4 border-l-4 border-l-[#14532d] space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-extrabold text-[#1c1917] truncate text-sm">
                        {item.commodity} <span className="text-[11px] font-normal text-[#78716c]">({item.variety})</span>
                      </h4>
                      <span className="text-[11px] text-[#57534e] font-semibold truncate block mt-0.5">
                        📍 {item.market}, {item.district} ({item.state})
                      </span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 border ${
                      item.source === 'enam'
                        ? 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]'
                        : 'bg-[#f0fdf4] text-[#14532d] border-[#bbf7d0]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.source === 'enam' ? 'bg-[#2563eb]' : 'bg-[#14532d]'}`}></span>
                      {item.source === 'enam' ? 'e-NAM Traded' : 'Agmarknet Spot'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f5f2eb] text-xs">
                    <div>
                      <span className="text-[10px] text-[#78716c] block">{t('overview.modalPrice')}</span>
                      <span className="font-extrabold text-sm text-[#14532d]">₹{item.modal_price.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-[#78716c]">/qtl</span></span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#78716c] block">{t('overview.minMaxPrice')}</span>
                      <span className="font-semibold text-[#44403c]">₹{item.min_price} - ₹{item.max_price}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#a8a29e] pt-1">
                    <span>{t('overview.arrivalDate')}: {item.arrival_date}</span>
                    <span className="font-bold text-[#14532d] uppercase">Grade FAQ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Human-Crafted Farmer Operations & Tools Grid (4 -> 2 -> 1 Responsive Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-extrabold text-[#1c1917] uppercase tracking-wider font-editorial text-xs sm:text-sm">
            {t('overview.farmerToolsTitle') || 'कृषि सुविधाएं व उपयोगी साधन'}
          </span>
          <span className="text-[11px] text-[#78716c] hidden sm:inline">{t('overview.modulesCount') || '8 प्रमुख कृषि मॉड्यूल'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            {
              title: t('overview.tileGovtSchemes') || 'Govt Schemes',
              sub: t('overview.tileGovtSchemesSub') || 'PM-KISAN & फसल बीमा',
              icon: 'account_balance',
              route: '/schemes',
              tag: t('overview.tileGovtSchemesTag') || 'DBT Active'
            },
            {
              title: t('overview.tileKccLoans') || 'KCC Loans',
              sub: t('overview.tileKccLoansSub') || '4% ब्याज दर पर ऋण',
              icon: 'credit_score',
              route: '/finance',
              tag: t('overview.tileKccLoansTag') || 'NABARD Scale'
            },
            {
              title: t('overview.tilePaymentVault') || 'Payment Vault',
              sub: t('overview.tilePaymentVaultSub') || 'सुरक्षित एस्क्रो भुगतान',
              icon: 'payments',
              route: '/payment',
              tag: t('overview.tilePaymentVaultTag') || 'RBI Compliant'
            },
            {
              title: t('overview.tileCropDoctor') || 'Crop Doctor',
              sub: t('overview.tileCropDoctorSub') || 'फोटो खींचकर रोग पहचान',
              icon: 'photo_camera',
              route: '/diagnose',
              tag: t('overview.tileCropDoctorTag') || 'ICAR Dosage'
            },
            {
              title: t('overview.tileSmartIrrigation') || 'Smart Irrigation',
              sub: t('overview.tileSmartIrrigationSub') || 'सिंचाई समय व IoT सेंसर',
              icon: 'water_drop',
              route: '/irrigation',
              tag: t('overview.tileSmartIrrigationTag') || 'Water Saver'
            },
            {
              title: t('overview.tileFarmRentals') || 'Farm Rentals',
              sub: t('overview.tileFarmRentalsSub') || 'ट्रैक्टर, कंबाइन व मजदूर',
              icon: 'agriculture',
              route: '/rentals',
              tag: t('overview.tileFarmRentalsTag') || 'Sharing Hub'
            },
            {
              title: t('overview.tileCropAlmanac') || 'Crop Almanac',
              sub: t('overview.tileCropAlmanacSub') || 'बुवाई से कटाई पंचांग',
              icon: 'calendar_month',
              route: '/calendar',
              tag: t('overview.tileCropAlmanacTag') || 'Push Alerts'
            },
            {
              title: t('overview.tileFarmerForum') || 'Farmer Forum',
              sub: t('overview.tileFarmerForumSub') || 'किसान चौपाल व अनुभव',
              icon: 'groups',
              route: '/community',
              tag: t('overview.tileFarmerForumTag') || 'Peer Advice'
            }
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
                <span>{currentCommodity.name} • {t('overview.spotPrice') || 'Spot Price'}</span>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full font-sans">
                  {currentCommodity.change}
                </span>
              </h3>
              <p className="text-[11px] text-[#78716c]">
                {t('overview.chartSubtitle') || 'उत्तर भारत की मंडियों में वास्तविक भारित औसत हाजिर भाव'}
              </p>
            </div>

            <div className="flex gap-1 bg-[#f5f2eb] p-1 rounded-xl text-xs font-bold self-end sm:self-auto">
              {['7D', '1M', '3M', '1Y'].map((timeTab) => (
                <button
                  key={timeTab}
                  onClick={() => setActiveTab(timeTab)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeTab === timeTab ? 'bg-white text-[#1c1917] shadow-2xs font-extrabold' : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  {timeTab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-60 sm:h-72 lg:h-80 w-full">
            <Line key={`${selectedCrop}-${activeTab}`} data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Tactile Farmer Field Task Notebook */}
        <div className="lg:col-span-4 paper-card p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-[#f5f2eb]">
              <h3 className="font-extrabold text-[#1c1917] flex items-center gap-1.5 font-editorial text-sm sm:text-base">
                <span className="material-symbols-outlined text-[#14532d] text-[18px]">checklist</span>
                {t('overview.fieldDiary') || 'खेत डायरी व कार्य'}
              </h3>
              <button
                onClick={() => setShowNoteModal(true)}
                className="text-[11px] font-bold text-[#b45309] hover:text-[#92400e]"
              >
                {t('overview.addNote') || '+ नोट जोड़ें'}
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
            {t('overview.openAlmanac') || 'संपूर्ण बुवाई पंचांग खोलें ➔'}
          </button>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-floating border border-[#e7e5e4] animate-in zoom-in-95">
            <h4 className="text-sm font-extrabold text-[#1c1917] mb-2 font-editorial">
              {t('overview.addNoteTitle') || 'खेत कार्य नोट जोड़ें'}
            </h4>
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
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-[#14532d] hover:bg-[#052e16] rounded-xl shadow-xs"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
