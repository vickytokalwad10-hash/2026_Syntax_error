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
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#839958', '#F7F4D5', '#105666']
      });
    }
  };

  const initiateDeal = async (target, type) => {
    const payload = {
      farmer_name: type === 'from_buyer_rfq' ? activeFarmer.name : target.farmer_name,
      buyer_company: type === 'from_buyer_rfq' ? target.buyer_company : activeBuyer.company,
      crop_name: target.crop_name,
      agreed_price_per_q: type === 'from_buyer_rfq' ? target.max_bid_price_per_q : target.asking_price_per_q,
      quantity_quintals: type === 'from_buyer_rfq' ? 100 : target.lot_size_quintals,
      farmgate_address: type === 'from_buyer_rfq' ? 'Village Farmgate, Karnal Highway' : target.farmgate_address,
      payment_terms: '100% Escrow Bank Guaranteed'
    };

    const res = await api.createDealContract(payload);
    if (res) {
      setContractModal(res);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    }
  };

  const filteredListings = listings.filter((l) => {
    const matchCrop = filterCrop === 'ALL' || l.crop_id === filterCrop;
    const matchSearch = l.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.farmer_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCrop && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Role Switcher & Profile Header */}
      <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'linear-gradient(135deg, rgba(10, 51, 35, 0.9) 0%, rgba(16, 86, 102, 0.75) 100%)', border: '1px solid var(--color-moss-green)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            background: role === 'farmer' ? 'linear-gradient(135deg, #839958, #0A3323)' : 'linear-gradient(135deg, #105666, #D3968C)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(131, 153, 88, 0.4)'
          }}>
            {role === 'farmer' ? <Wheat size={24} color="#F7F4D5" /> : <Building2 size={24} color="#F7F4D5" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                {role === 'farmer' ? 'Farmer Direct-Sell Portal (Kisan Mandi)' : 'Institutional Buyer Sourcing Portal'}
              </h2>
              <span className="badge badge-moss" style={{ fontSize: '0.72rem' }}>
                <ShieldCheck size={12} /> {role === 'farmer' ? activeFarmer.kyc : activeBuyer.badge}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {role === 'farmer' 
                ? `Logged in as: ${activeFarmer.name} (${activeFarmer.location}) • 0% Commission Fee` 
                : `Logged in as: ${activeBuyer.company} • ${activeBuyer.role}`}
            </div>
          </div>
        </div>

        {/* Portal Role Switch Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(5, 28, 19, 0.7)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(131, 153, 88, 0.3)' }}>
          <button
            onClick={() => setRole('farmer')}
            className={role === 'farmer' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none' }}
          >
            <Wheat size={16} />
            <span>I am a Farmer</span>
          </button>
          <button
            onClick={() => setRole('buyer')}
            className={role === 'buyer' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none' }}
          >
            <Building2 size={16} />
            <span>I am a Buyer / Mill</span>
          </button>
        </div>
      </div>

      {/* ===================== FARMER PORTAL VIEW ===================== */}
      {role === 'farmer' && (
        <>
          {/* Middleman Savings Hero Banner */}
          {marginData && (
            <div className="agri-card-solid" style={{ borderLeft: '6px solid var(--color-moss-green-light)', padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Sparkles size={18} color="var(--color-moss-green-light)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-moss-green-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Middleman Elimination Advantage (Farmgate Direct)
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                    Earn +₹{marginData.extra_profit_earned.toLocaleString()} Extra on 100 Quintals Lot
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Bypass 2.5% Arthiya commission, 2% Mandi Cess, and ₹45/Q transport. Institutional buyers pick up directly from your farmgate.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right', padding: '10px 18px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.3)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NET GAIN PERCENTAGE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-moss-green-light)' }}>
                      +{marginData.extra_profit_percentage}%
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowListModal(true)} 
                    className="btn-primary"
                    style={{ height: '48px', padding: '0 24px', fontSize: '0.92rem' }}
                  >
                    <PlusCircle size={18} />
                    <span>List My Harvest Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Farmer Sections: Live Buyer Demands & My Listings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* Live Verified Buyer Demands (RFQs) */}
            <div className="agri-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
                    Institutional Buyers Seeking Produce Right Now
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Verified mills, exporters, and supermarket chains ready to buy at agreed prices
                  </p>
                </div>
                <span className="badge badge-moss">Escrow Protected</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {buyers.map((b) => (
                  <div 
                    key={b.id}
                    style={{ 
                      padding: '16px 20px', 
                      background: 'rgba(10, 51, 35, 0.65)', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(131, 153, 88, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '1rem', color: 'var(--color-beige)' }}>{b.buyer_company}</strong>
                          {b.urgent && <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>Urgent Demand</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {b.buyer_type} • {b.buyer_location}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-moss-green-light)' }}>
                          ₹{b.max_bid_price_per_q.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/ Quintal Max Bid</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(131, 153, 88, 0.15)', paddingTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div>
                        Looking for: <strong style={{ color: 'var(--color-beige)' }}>{b.crop_name}</strong> ({b.target_volume_mt} MT)
                      </div>
                      <button 
                        onClick={() => initiateDeal(b, 'from_buyer_rfq')}
                        className="btn-primary"
                        style={{ padding: '5px 14px', fontSize: '0.75rem' }}
                      >
                        <span>Sell to Buyer</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Active Harvest Listings */}
            <div className="agri-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
                    My Active Harvest Listings
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Lots visible to 140+ institutional buyers across India
                  </p>
                </div>
                <button 
                  onClick={() => setShowListModal(true)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  <PlusCircle size={14} />
                  <span>New Lot</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {listings.filter(l => l.farmer_name === activeFarmer.name || l.farmer_name.includes('Harpreet')).map((l) => (
                  <div 
                    key={l.id}
                    style={{ 
                      padding: '16px 18px', 
                      background: 'rgba(16, 86, 102, 0.25)', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-midnight-green-glow)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--color-beige)' }}>{l.crop_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Lot #{l.id} • {l.variety} • {l.lot_size_quintals} Q
                        </div>
                      </div>
                      <span className="badge badge-moss" style={{ fontSize: '0.72rem' }}>
                        ₹{l.asking_price_per_q}/Q
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', background: 'rgba(5, 28, 19, 0.5)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <span>Bids: <strong style={{ color: 'var(--color-moss-green-light)' }}>{l.active_bids_count} offers</strong> (Top: ₹{l.highest_bid}/Q)</span>
                      <button 
                        onClick={() => initiateDeal(l, 'from_farmer_lot')}
                        className="btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      >
                        <span>Accept Top Bid</span>
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
          {/* Buyer Search & Filter Bar */}
          <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by crop, farmer, or state (e.g., Sharbati Wheat, Nashik, Punjab)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ border: 'none', background: 'transparent' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CROP:</span>
              {['ALL', 'wheat', 'rice', 'onion', 'soybean'].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCrop(c)}
                  className={filterCrop === c ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Farmer Harvest Lots Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredListings.map((lot) => (
              <div 
                key={lot.id} 
                className="agri-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: '4px solid var(--color-moss-green)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge badge-midnight" style={{ fontSize: '0.7rem' }}>
                      Lot #{lot.id}
                    </span>
                    {lot.organic_certified && (
                      <span className="badge badge-moss" style={{ fontSize: '0.7rem' }}>
                        🌱 Organic Certified
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-beige)' }}>
                    {lot.crop_name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Variety: {lot.variety} • Grade: {lot.quality_grade}
                  </div>

                  {/* Lot Spec Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(5, 28, 19, 0.7)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LOT QUANTITY</span>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                        {lot.lot_size_quintals} Quintals
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MOISTURE LEVEL</span>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: lot.moisture_pct <= 12 ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)' }}>
                        {lot.moisture_pct}% (Ideal)
                      </div>
                    </div>
                  </div>

                  {/* Location & Farmer Details */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MapPin size={13} color="var(--color-rosy-brown)" />
                    <span>{lot.district}, {lot.state} ({lot.farmer_name})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    {lot.pickup_ready_date}
                  </div>
                </div>

                {/* Price & Instant Buy Action */}
                <div style={{ borderTop: '1px solid rgba(131, 153, 88, 0.2)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ASKING FARMGATE PRICE</span>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                      ₹{lot.asking_price_per_q.toLocaleString()}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/Q</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => initiateDeal(lot, 'from_farmer_lot')}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <Lock size={13} />
                    <span>Buy with Escrow</span>
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
          background: 'rgba(2, 18, 12, 0.85)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="agri-card-solid" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--color-moss-green)', position: 'relative' }}>
            <button 
              onClick={() => setShowListModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-beige)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Wheat size={24} color="var(--color-moss-green-light)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                List Your Harvest for Direct Buyer Sale
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Your produce will be broadcast directly to 140+ verified institutional flour mills, crushers, and supermarket sourcing teams.
            </p>

            <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Crop Commodity
                </label>
                <select 
                  value={newCropId} 
                  onChange={(e) => {
                    setNewCropId(e.target.value);
                    setNewCropName(e.target.options[e.target.selectedIndex].text);
                  }}
                  className="select-field"
                >
                  <option value="wheat">Wheat (Sharbati Gold)</option>
                  <option value="rice">Paddy / Rice (Basmati 1121)</option>
                  <option value="onion">Onion (Nashik Red)</option>
                  <option value="soybean">Soybean (Yellow Oil Grade)</option>
                  <option value="cotton">Cotton (Medium Staple)</option>
                  <option value="mustard">Mustard (Rapeseed)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Specific Variety
                  </label>
                  <input 
                    type="text" 
                    value={newVariety} 
                    onChange={(e) => setNewVariety(e.target.value)} 
                    className="input-field" 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Lot Size (Quintals)
                  </label>
                  <input 
                    type="number" 
                    value={newLotSize} 
                    onChange={(e) => setNewLotSize(e.target.value)} 
                    className="input-field" 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Asking Price (₹ / Quintal)
                  </label>
                  <input 
                    type="number" 
                    value={newAskingPrice} 
                    onChange={(e) => setNewAskingPrice(e.target.value)} 
                    className="input-field" 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Moisture Content (%)
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={newMoisture} 
                    onChange={(e) => setNewMoisture(e.target.value)} 
                    className="input-field" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Farmgate Pickup Address
                </label>
                <input 
                  type="text" 
                  value={newAddress} 
                  onChange={(e) => setNewAddress(e.target.value)} 
                  className="input-field" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input 
                  type="checkbox" 
                  id="organic_check" 
                  checked={newOrganic} 
                  onChange={(e) => setNewOrganic(e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-moss-green)' }}
                />
                <label htmlFor="organic_check" style={{ fontSize: '0.82rem', color: 'var(--color-beige)', cursor: 'pointer' }}>
                  Certified Organic Produce (NPOP / Jaivik Bharat)
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '10px', height: '46px', fontSize: '0.92rem' }}
              >
                <Sparkles size={16} />
                <span>Publish Produce to Direct Buyers</span>
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
          background: 'rgba(2, 18, 12, 0.88)', 
          backdropFilter: 'blur(10px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="agri-card-solid" style={{ width: '100%', maxWidth: '600px', border: '2px solid var(--color-moss-green-light)', position: 'relative', padding: '30px' }}>
            <button 
              onClick={() => setContractModal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-beige)', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: 'rgba(131, 153, 88, 0.25)', 
                color: 'var(--color-moss-green-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <span className="badge badge-moss" style={{ marginBottom: '8px' }}>
                <Lock size={12} /> {contractModal.escrow_status}
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                Digital Direct Trade Contract
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Token ID: {contractModal.contract_id} • Created: {contractModal.created_at}
              </div>
            </div>

            {/* Contract Summary Box */}
            <div style={{ background: 'rgba(5, 28, 19, 0.8)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>FARMER:</span>
                <strong style={{ color: 'var(--color-beige)', fontSize: '0.88rem' }}>{contractModal.farmer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>INSTITUTIONAL BUYER:</span>
                <strong style={{ color: 'var(--color-beige)', fontSize: '0.88rem' }}>{contractModal.buyer_company}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>PRODUCE:</span>
                <strong style={{ color: 'var(--color-beige)', fontSize: '0.88rem' }}>{contractModal.crop_name} ({contractModal.quantity_quintals} Quintals)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(131, 153, 88, 0.2)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>TOTAL DEAL VALUE:</span>
                <strong style={{ color: 'var(--color-moss-green-light)', fontSize: '1.25rem', fontWeight: '800' }}>
                  ₹{contractModal.total_deal_value.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Logistics & Pickup Window */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={15} color="var(--color-moss-green-light)" />
                <span><strong>Farmgate Pickup Window:</strong> {contractModal.pickup_window}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={15} color="var(--color-moss-green-light)" />
                <span><strong>Digital QR Pass:</strong> Verified for Gate Entry & Truck Loading</span>
              </div>
            </div>

            <button 
              onClick={() => setContractModal(null)}
              className="btn-primary"
              style={{ width: '100%', height: '44px' }}
            >
              <span>Done & Download Contract Slip</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
