import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Plus, TrendingUp, DollarSign, ShieldCheck,
  MapPin, CheckCircle2, Clock, ArrowRight, Sparkles,
  Package, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { user, token, role, logout, API_BASE } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newListing, setNewListing] = useState({
    crop_name: 'Wheat (Sharbati Gold)',
    category: 'Grains',
    variety: 'Sharbati A-1',
    quantity_quintals: 100,
    price_per_quintal: 2800,
    location: user?.village_district || 'Nashik, Maharashtra',
    harvest_date: new Date().toISOString().split('T')[0],
    quality_grade: 'Grade A Premium',
    moisture_pct: 11.5
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch listings
      const res = await fetch(`${API_BASE}/api/payment/listings`);
      const data = await res.json();
      if (data.listings) {
        setListings(data.listings);
      }

      // Fetch farmer transactions
      if (token) {
        const txRes = await fetch(`${API_BASE}/api/payment/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const txData = await txRes.json();
        if (txData.transactions) {
          setTransactions(txData.transactions);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || role !== 'farmer') {
      navigate('/auth/farmer/login');
      return;
    }
    fetchData();
  }, [token, role]);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/payment/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newListing)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Farmer Banner & Profile Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #FDE68A',
        borderRadius: '16px',
        padding: '1.5rem 1.8rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: '#FEF3C7',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sprout size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {user?.name || 'Farmer Partner'}
              </h1>
              <span style={{
                background: '#DCFCE7',
                color: '#166534',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {t('common.verified')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: '#64748B' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> {user?.village_district || 'Maharashtra'}
              </span>
              <span>•</span>
              <span>Crops: {user?.crops_grown?.join(', ') || 'Wheat, Soybean'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.2)'
            }}
          >
            <Plus size={18} /> {t('marketplace.listHarvest')}
          </button>
          <button
            onClick={logout}
            style={{
              padding: '10px 14px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {t('common.signOut')}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Active Listings</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
            {listings.filter(l => l.status === 'available').length} Lots
          </div>
          <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: '600' }}>Ready for Buyer Bids</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Lot Value</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#D97706', marginTop: '4px' }}>
            ₹{listings.reduce((acc, l) => acc + (l.total_value || 0), 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Direct Farm Gate Value</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Escrow Settlements</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#16A34A', marginTop: '4px' }}>
            ₹{transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: '600' }}>100% 2FA Verified</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>AI Agronomy Index</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
            94% Healthy
          </div>
          <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: '600' }}>NDVI Optimal</span>
        </div>
      </div>

      {/* Active Crop Listings Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: '0 0 2px 0' }}>
              My Produce Listings & Buyer Market
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
              Live inventory broadcasted to registered institutional & wholesale buyers
            </p>
          </div>
          <button onClick={fetchData} style={{ background: 'transparent', border: 'none', color: '#D97706', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Produce & Variety</th>
                <th style={{ padding: '10px 12px' }}>Quantity</th>
                <th style={{ padding: '10px 12px' }}>Price / Quintal</th>
                <th style={{ padding: '10px 12px' }}>Total Est. Value</th>
                <th style={{ padding: '10px 12px' }}>Quality / Moisture</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(lot => (
                <tr key={lot.listing_id || lot._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#0F172A' }}>
                    {lot.crop_name}
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '400' }}>{lot.variety} • {lot.location}</div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{lot.quantity_quintals} Quintals</td>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#D97706' }}>₹{lot.price_per_quintal} / Q</td>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#0F172A' }}>₹{lot.total_value?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {lot.quality_grade || 'Grade A'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '6px' }}>{lot.moisture_pct}% Moist</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: lot.status === 'sold' ? '#DCFCE7' : '#FEF3C7',
                      color: lot.status === 'sold' ? '#166534' : '#92400E'
                    }}>
                      {lot.status === 'sold' ? 'Sold & Settled' : 'Available for Bids'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Buyer Offers & Escrow Transactions */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
          Direct Buyer Settlements & 2FA Escrow Ledger
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1rem 0' }}>
          Cryptographically signed payments deposited into your registered bank account
        </p>

        {transactions.length === 0 ? (
          <div style={{
            background: '#F8FAFC',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            color: '#64748B',
            fontSize: '0.9rem'
          }}>
            <ShieldCheck size={36} color="#CBD5E1" style={{ margin: '0 auto 8px auto' }} />
            No settled transactions yet. Once a buyer purchases your listed crop lots, the 2FA verified escrow will appear here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Order ID</th>
                  <th style={{ padding: '10px 12px' }}>Buyer Name</th>
                  <th style={{ padding: '10px 12px' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Payment ID</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id || tx.order_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0F172A' }}>{tx.order_id}</td>
                    <td style={{ padding: '12px' }}>{tx.buyer_name || 'Verified Buyer'}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#16A34A' }}>₹{tx.amount?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.gateway_payment_id || 'Pending'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: '#DCFCE7',
                        color: '#166534',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        ✓ {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Listing Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
              List Crop Lot for Direct Sale
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Set your target farm-gate price. Buyers will bid directly or purchase at fixed rate.
            </p>

            <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Crop Name & Produce Type
                </label>
                <input
                  type="text"
                  value={newListing.crop_name}
                  onChange={(e) => setNewListing({ ...newListing, crop_name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Quantity (Quintals)
                  </label>
                  <input
                    type="number"
                    value={newListing.quantity_quintals}
                    onChange={(e) => setNewListing({ ...newListing, quantity_quintals: parseFloat(e.target.value) || 0 })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Price / Quintal (₹)
                  </label>
                  <input
                    type="number"
                    value={newListing.price_per_quintal}
                    onChange={(e) => setNewListing({ ...newListing, price_per_quintal: parseFloat(e.target.value) || 0 })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Quality Grade
                  </label>
                  <select
                    value={newListing.quality_grade}
                    onChange={(e) => setNewListing({ ...newListing, quality_grade: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  >
                    <option value="Grade A Premium">Grade A Premium</option>
                    <option value="Grade A Standard">Grade A Standard</option>
                    <option value="Export Grade">Export Grade</option>
                    <option value="Commercial Grade">Commercial Grade</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Farm Location
                  </label>
                  <input
                    type="text"
                    value={newListing.location}
                    onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{
                background: '#FEF3C7',
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '4px'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#92400E' }}>Total Projected Payout:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#92400E' }}>
                  ₹{(newListing.quantity_quintals * newListing.price_per_quintal).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '10px', background: '#D97706', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
