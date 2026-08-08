import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  PlusCircle, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Truck, 
  BadgeIndianRupee, 
  Building2, 
  UserCheck, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  QrCode, 
  FileText, 
  Search, 
  Filter, 
  MapPin, 
  Lock, 
  Wheat,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const FARMER_PROFILES = [
  { id: 'f-1', name: 'Sardar Harpreet Singh', location: 'Ludhiana, Punjab', kyc: 'Verified Farmer ID', crops: 'Wheat, Rice' },
  { id: 'f-2', name: 'Rameshwar Patil', location: 'Nashik, Maharashtra', kyc: 'Verified Farmer ID', crops: 'Onion, Tomato' },
  { id: 'f-3', name: 'Devendra Gurjar', location: 'Indore, MP', kyc: 'Verified Farmer ID', crops: 'Soybean, Mustard' }
];

const BUYER_PROFILES = [
  { id: 'b-1', company: 'ITC Choupal Procurement Ltd', role: 'Chief Sourcing Manager', location: 'Delhi NCR Hub', badge: 'Tier-1 Institutional Buyer' },
  { id: 'b-2', company: 'Adani Wilmar Agri Foods', role: 'Senior Sourcing Executive', location: 'Indore Processing Plant', badge: 'Verified Mega Mill' },
  { id: 'b-3', company: 'Reliance Fresh Direct Sourcing', role: 'Category Head - Staples', location: 'Navi Mumbai Hub', badge: 'National Supermarket' }
];

export default function DirectMarketView() {
  const { t, language } = useLanguage();
  const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
  const [activeFarmer, setActiveFarmer] = useState(FARMER_PROFILES[0]);
  const [activeBuyer, setActiveBuyer] = useState(BUYER_PROFILES[0]);

  const [listings, setListings] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [marginData, setMarginData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listing Modal State
  const [showListModal, setShowListModal] = useState(false);
  const [newCropId, setNewCropId] = useState('wheat');
  const [newCropName, setNewCropName] = useState('Wheat (Sharbati Gold)');
  const [newVariety, setNewVariety] = useState('HD-3086 Premium');
  const [newLotSize, setNewLotSize] = useState(150);
  const [newAskingPrice, setNewAskingPrice] = useState(2890);
  const [newMoisture, setNewMoisture] = useState(11.5);
  const [newOrganic, setNewOrganic] = useState(true);
  const [newGrade, setNewGrade] = useState('Grade A+ Export Quality');
  const [newAddress, setNewAddress] = useState('Farmgate #12, GT Road, Ludhiana, Punjab');

  // Deal Contract Modal State
  const [contractModal, setContractModal] = useState(null);

  // Buyer filters
  const [filterCrop, setFilterCrop] = useState('ALL');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [lRes, bRes, mRes] = await Promise.all([
      api.getDirectListings(),
      api.getBuyerDemands(),
      api.calculateDirectMargin('wheat', 100, 2880)
    ]);

    if (lRes && lRes.listings) setListings(lRes.listings);
    if (bRes && bRes.buyer_demands) setBuyers(bRes.buyer_demands);
    if (mRes) setMarginData(mRes);
    setLoading(false);
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    const payload = {
      farmer_name: activeFarmer.name,
      farmer_contact: '+91 98765-43210',
      state: activeFarmer.location.split(',')[1]?.trim() || 'Punjab',
      district: activeFarmer.location.split(',')[0]?.trim() || 'Ludhiana',
      crop_id: newCropId,
      crop_name: newCropName,
      variety: newVariety,
      lot_size_quintals: parseFloat(newLotSize),
      asking_price_per_q: parseFloat(newAskingPrice),
      moisture_pct: parseFloat(newMoisture),
      organic_certified: newOrganic,
      quality_grade: newGrade,
      farmgate_address: newAddress
    };

    const res = await api.createDirectListing(payload);
    if (res && res.listing) {
      setListings([res.listing, ...listings]);
      setShowListModal(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  const initiateDeal = async (item, originType) => {
    const isFromBuyer = originType === 'from_buyer_rfq';
    const payload = {
      farmer_id: activeFarmer.id,
      farmer_name: activeFarmer.name,
      buyer_id: isFromBuyer ? item.id : 'b-1',
      buyer_company: isFromBuyer ? item.buyer_company : 'ITC Choupal Sourcing Ltd',
      crop_id: item.crop_id || 'wheat',
      crop_name: item.crop_name,
      quantity_quintals: item.target_volume_mt ? item.target_volume_mt * 10 : (item.lot_size_quintals || 100),
      agreed_price_per_q: isFromBuyer ? item.max_bid_price_per_q : (item.highest_bid || item.asking_price_per_q),
      farmgate_location: activeFarmer.location,
      buyer_delivery_hub: isFromBuyer ? item.buyer_location : 'Delhi NCR Sourcing Hub'
    };

    const res = await api.createDirectDeal(payload);
    if (res && res.contract) {
      setContractModal(res.contract);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    }
  };

  const filteredListings = listings.filter((l) => {
    const matchesCrop = filterCrop === 'ALL' || l.crop_id === filterCrop;
    const matchesSearch = searchQuery === '' || 
      l.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Header & Persona Switch */}
      <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '6px', 
            background: '#FEF3C7', 
            color: '#92400E', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {role === 'farmer' ? <Wheat size={22} color="#D97706" /> : <Building2 size={22} color="#D97706" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                {role === 'farmer' ? t('farmerPortal') : t('buyerPortal')}
              </h2>
              <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>
                <ShieldCheck size={12} /> {role === 'farmer' ? activeFarmer.kyc : activeBuyer.badge}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
              {role === 'farmer' 
                ? `${activeFarmer.name} (${activeFarmer.location}) • ${t('zeroMandiFee')}` 
                : `${activeBuyer.company} • ${activeBuyer.role}`}
            </div>
          </div>
        </div>

        {/* Portal Role Switch Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
          <button
            onClick={() => setRole('farmer')}
            className={role === 'farmer' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Wheat size={14} />
            <span>{t('farmerMode')}</span>
          </button>
          <button
            onClick={() => setRole('buyer')}
            className={role === 'buyer' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Building2 size={14} />
            <span>{t('buyerMode')}</span>
          </button>
        </div>
      </div>

      {/* ===================== FARMER PORTAL VIEW ===================== */}
      {role === 'farmer' && (
        <>
          {/* Middleman Savings Hero Banner */}
          {marginData && (
            <div className="agri-card" style={{ borderLeft: '5px solid #D97706', padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Sparkles size={16} color="#D97706" />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('directGain')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A' }}>
                    +₹{marginData.extra_profit_earned.toLocaleString()} Net Extra Gain on 100 Quintals
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                    {t('zeroMandiFee')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right', padding: '8px 14px', background: '#FEF3C7', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                    <div style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: '600' }}>{t('directGain')}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#92400E' }}>
                      +{marginData.extra_profit_percentage}%
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowListModal(true)} 
                    className="btn-primary"
                    style={{ height: '40px', padding: '0 18px', fontSize: '0.85rem' }}
                  >
                    <PlusCircle size={16} />
                    <span>{t('createNewListing')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Farmer Sections: Live Buyer Demands & My Listings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Live Verified Buyer Demands (RFQs) */}
            <div className="agri-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>
                    {t('corporateDemands')}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {t('zeroMandiFee')}
                  </p>
                </div>
                <span className="badge badge-yellow">Escrow Protected</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {buyers.map((b) => (
                  <div 
                    key={b.id}
                    style={{ 
                      padding: '12px 14px', 
                      background: '#F8FAFC', 
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{b.buyer_company}</strong>
                          {b.urgent && <span className="badge badge-rose" style={{ fontSize: '0.62rem' }}>Urgent</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          {b.buyer_type} • {b.buyer_location}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#D97706' }}>
                          ₹{b.max_bid_price_per_q.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>/ Quintal Max</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '8px', fontSize: '0.78rem', color: '#64748B' }}>
                      <div>
                        {t('cropType')}: <strong style={{ color: '#0F172A' }}>{b.crop_name}</strong> ({b.target_volume_mt} MT)
                      </div>
                      <button 
                        onClick={() => initiateDeal(b, 'from_buyer_rfq')}
                        className="btn-primary"
                        style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                      >
                        <span>{t('tradeProduce')}</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Active Harvest Listings */}
            <div className="agri-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>
                    {t('activeFarmerLots')}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {t('zeroMandiFee')}
                  </p>
                </div>
                <button 
                  onClick={() => setShowListModal(true)}
                  className="btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                >
                  <PlusCircle size={13} />
                  <span>{t('createNewListing')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {listings.filter(l => l.farmer_name === activeFarmer.name || l.farmer_name.includes('Harpreet')).map((l) => (
                  <div 
                    key={l.id}
                    style={{ 
                      padding: '12px 14px', 
                      background: '#F8FAFC', 
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{l.crop_name}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Lot #{l.id} • {l.variety} • {l.lot_size_quintals} Q
                        </div>
                      </div>
                      <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>
                        ₹{l.asking_price_per_q}/Q
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B', marginTop: '6px', background: '#FFFFFF', padding: '6px 10px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                      <span>Bids: <strong style={{ color: '#D97706' }}>{l.active_bids_count} offers</strong> (Top: ₹{l.highest_bid}/Q)</span>
                      <button 
                        onClick={() => initiateDeal(l, 'from_farmer_lot')}
                        className="btn-primary"
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        <span>{t('acceptContract')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===================== BUYER PORTAL VIEW ===================== */}
      {role === 'buyer' && (
        <>
          {/* Commodity Category Filter */}
          <div className="agri-card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedCropFilter('all')}
                className={selectedCropFilter === 'all' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                All Commodities
              </button>
              {['wheat', 'rice', 'onion', 'soybean', 'cotton', 'mustard'].map(crop => (
                <button
                  key={crop}
                  onClick={() => setSelectedCropFilter(crop)}
                  className={selectedCropFilter === crop ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                >
                  {t(crop) || crop.charAt(0).toUpperCase() + crop.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Farmer Harvest Lots Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredListings.map((lot) => (
              <div 
                key={lot.id} 
                className="agri-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: '3px solid #D97706'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span className="badge badge-white" style={{ fontSize: '0.68rem' }}>
                      Lot #{lot.id}
                    </span>
                    {lot.organic_certified && (
                      <span className="badge badge-yellow" style={{ fontSize: '0.68rem' }}>
                        Organic
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0F172A' }}>
                    {lot.crop_name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px' }}>
                    {t('variety')}: {lot.variety} • Grade: {lot.quality_grade}
                  </div>

                  {/* Lot Spec Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{t('lotQuantity')}</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A' }}>
                        {lot.lot_size_quintals} Q
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>MOISTURE</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: '800', color: lot.moisture_pct <= 12 ? '#059669' : '#DC2626' }}>
                        {lot.moisture_pct}%
                      </div>
                    </div>
                  </div>

                  {/* Location & Farmer Details */}
                  <div style={{ fontSize: '0.78rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <MapPin size={12} color="#D97706" />
                    <span>{lot.district}, {lot.state} ({lot.farmer_name})</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '12px' }}>
                    {lot.pickup_ready_date}
                  </div>
                </div>

                {/* Price & Instant Buy Action */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{t('askingPrice')}</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                      ₹{lot.asking_price_per_q.toLocaleString()}<span style={{ fontSize: '0.7rem', color: '#64748B' }}>/Q</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => initiateDeal(lot, 'from_farmer_lot')}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  >
                    <Lock size={12} />
                    <span>{t('bookLot')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===================== LIST HARVEST MODAL ===================== */}
      {showListModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="agri-card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #E2E8F0', position: 'relative', background: '#FFFFFF', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <button 
              onClick={() => setShowListModal(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Wheat size={20} color="#D97706" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                {t('createNewListing')}
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '16px' }}>
              {t('zeroMandiFee')}
            </p>

            <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0F172A', display: 'block', marginBottom: '3px' }}>
                  {t('cropType')}
                </label>
                <select 
                  value={newCropId} 
                  onChange={(e) => {
                    setNewCropId(e.target.value);
                    setNewCropName(e.target.options[e.target.selectedIndex].text);
                  }}
                  className="input-field"
                  style={{ padding: '6px 10px' }}
                >
                  <option value="wheat">Wheat (Sharbati Gold)</option>
                  <option value="rice">Paddy / Rice (Basmati 1121)</option>
                  <option value="onion">Onion (Nashik Red)</option>
                  <option value="soybean">Soybean (Yellow Oil Grade)</option>
                  <option value="cotton">Cotton (Medium Staple)</option>
                  <option value="mustard">Mustard (Rapeseed)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0F172A', display: 'block', marginBottom: '3px' }}>
                    {t('variety')}
                  </label>
                  <input 
                    type="text" 
                    value={newVariety} 
                    onChange={(e) => setNewVariety(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '6px 10px' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0F172A', display: 'block', marginBottom: '3px' }}>
                    {t('lotQuantity')}
                  </label>
                  <input 
                    type="number" 
                    value={newLotSize} 
                    onChange={(e) => setNewLotSize(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '6px 10px' }}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0F172A', display: 'block', marginBottom: '3px' }}>
                    {t('askingPrice')}
                  </label>
                  <input 
                    type="number" 
                    value={newAskingPrice} 
                    onChange={(e) => setNewAskingPrice(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '6px 10px' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0F172A', display: 'block', marginBottom: '3px' }}>
                    Moisture Content (%)
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={newMoisture} 
                    onChange={(e) => setNewMoisture(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '6px 10px' }}
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0F172A', display: 'block', marginBottom: '3px' }}>
                  Farmgate Pickup Address
                </label>
                <input 
                  type="text" 
                  value={newAddress} 
                  onChange={(e) => setNewAddress(e.target.value)} 
                  className="input-field" 
                  style={{ padding: '6px 10px' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
                <input 
                  type="checkbox" 
                  id="organic_check" 
                  checked={newOrganic} 
                  onChange={(e) => setNewOrganic(e.target.checked)} 
                  style={{ width: '15px', height: '15px', accentColor: '#D97706' }}
                />
                <label htmlFor="organic_check" style={{ fontSize: '0.8rem', color: '#0F172A', cursor: 'pointer' }}>
                  Certified Organic Produce (NPOP / Jaivik Bharat)
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '8px', height: '40px', fontSize: '0.85rem' }}
              >
                <Sparkles size={15} />
                <span>{t('listProduceBtn')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DIGITAL ESCROW CONTRACT MODAL ===================== */}
      {contractModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="agri-card" style={{ width: '100%', maxWidth: '520px', border: '2px solid #D97706', position: 'relative', padding: '24px', background: '#FFFFFF', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <button 
              onClick={() => setContractModal(null)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '6px', 
                background: '#FEF3C7', 
                color: '#92400E', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 10px'
              }}>
                <CheckCircle2 size={26} />
              </div>
              <span className="badge badge-yellow" style={{ marginBottom: '6px' }}>
                <Lock size={12} /> {contractModal.escrow_status}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A' }}>
                Digital Direct Trade Contract
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Token ID: {contractModal.contract_id} • Created: {contractModal.created_at}
              </div>
            </div>

            {/* Contract Summary Box */}
            <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>FARMER:</span>
                <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{contractModal.farmer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>BUYER:</span>
                <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{contractModal.buyer_company}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>PRODUCE:</span>
                <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{contractModal.crop_name} ({contractModal.quantity_quintals} Q)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>TOTAL VALUE:</span>
                <strong style={{ color: '#D97706', fontSize: '1.15rem', fontWeight: '800' }}>
                  ₹{contractModal.total_deal_value.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Logistics & Pickup Window */}
            <div style={{ fontSize: '0.78rem', color: '#0F172A', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} color="#D97706" />
                <span><strong>Farmgate Pickup:</strong> {contractModal.pickup_window}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <QrCode size={14} color="#D97706" />
                <span><strong>Digital QR Pass:</strong> Verified for Gate Entry</span>
              </div>
            </div>

            <button 
              onClick={() => setContractModal(null)}
              className="btn-primary"
              style={{ width: '100%', height: '38px' }}
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
