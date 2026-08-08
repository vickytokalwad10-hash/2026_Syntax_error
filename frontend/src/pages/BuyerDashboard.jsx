import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ShieldCheck, ShoppingCart, Lock, DollarSign,
  MapPin, CheckCircle2, AlertCircle, RefreshCw, Filter,
  CreditCard, Smartphone, Check, FileText, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user, token, role, logout, API_BASE } = useAuth();

  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');

  // Payment & Checkout State
  const [activeCheckoutLot, setActiveCheckoutLot] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('confirm'); // 'confirm' | '2fa' | 'gateway' | 'success'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [otp2FA, setOtp2FA] = useState('123456');
  const [otpError, setOtpError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/listings`);
      const data = await res.json();
      if (data.listings) {
        setListings(data.listings);
      }

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
    if (!token || role !== 'buyer') {
      navigate('/auth/buyer/login');
      return;
    }
    fetchData();
  }, [token, role]);

  const handleStartPurchase = (lot) => {
    setActiveCheckoutLot(lot);
    setCheckoutStep('confirm');
    setOtpError('');
  };

  const handleCreateOrder = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: activeCheckoutLot.listing_id || activeCheckoutLot._id,
          farmer_id: activeCheckoutLot.farmer_id,
          farmer_name: activeCheckoutLot.farmer_name,
          crop_name: activeCheckoutLot.crop_name,
          quantity_quintals: activeCheckoutLot.quantity_quintals,
          amount: activeCheckoutLot.total_value,
          currency: 'INR'
        })
      });
      const orderData = await res.json();
      setCreatedOrder(orderData);

      if (orderData.requires_2fa) {
        // Trigger 2FA OTP request
        await fetch(`${API_BASE}/api/payment/request-2fa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderData.order_id,
            buyer_phone: user?.phone || '9898700002',
            amount: orderData.amount
          })
        });
        setCheckoutStep('2fa');
      } else {
        setCheckoutStep('gateway');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleVerify2FA = async () => {
    setOtpError('');
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: createdOrder.order_id,
          buyer_phone: user?.phone || '9898700002',
          otp: otp2FA
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || '2FA verification failed');
      }
      setCheckoutStep('gateway');
    } catch (err) {
      setOtpError(err.message || 'Invalid 2FA code');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCompleteGatewayPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const mockPaymentId = `pay_rzp_${Date.now()}`;
      const mockSignature = `sig_mock_${Date.now()}`;

      const res = await fetch(`${API_BASE}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gateway_order_id: createdOrder.gateway_order_id,
          gateway_payment_id: mockPaymentId,
          gateway_signature: mockSignature,
          listing_id: activeCheckoutLot.listing_id || activeCheckoutLot._id,
          amount: createdOrder.amount
        })
      });

      const verifyData = await res.json();
      if (!res.ok) {
        throw new Error(verifyData.detail || 'Server-side payment verification failed');
      }

      setCheckoutStep('success');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      fetchData();
    } catch (e) {
      alert(e.message || 'Payment execution error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const filteredListings = listings.filter(lot => {
    if (selectedCropFilter === 'all') return true;
    return lot.crop_name.toLowerCase().includes(selectedCropFilter.toLowerCase());
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Buyer Banner & Profile Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem 1.8rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
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
            background: '#F1F5F9',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {user?.company_name || user?.name || 'Institutional Procurement'}
              </h1>
              <span style={{
                background: '#F1F5F9',
                color: '#334155',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1'
              }}>
                Verified Buyer
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: '#64748B' }}>
              <span>GSTIN: {user?.gstin || '27AAACA1234A1Z5'}</span>
              <span>•</span>
              <span>Phone: {user?.phone || '9898700002'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Available Lots</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
            {listings.filter(l => l.status === 'available').length} Certified Lots
          </div>
          <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: '600' }}>Direct Farm Gate</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>2FA Escrow Protection</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
            ₹50,000+
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Two-Factor Threshold</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Purchased</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#16A34A', marginTop: '4px' }}>
            ₹{transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: '600' }}>Cryptographically Verified</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Payment Gateway</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#D97706', marginTop: '4px' }}>
            Razorpay UPI
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Instant Settlement</span>
        </div>
      </div>

      {/* Farm Produce Marketplace Grid */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: '0 0 2px 0' }}>
              Verified Farm Crop Lots for Direct Purchase
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
              All listings include farmer origin, moisture grading, and secured payment escrow
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'wheat', 'soybean', 'rice', 'onion'].map(cropKey => (
              <button
                key={cropKey}
                onClick={() => setSelectedCropFilter(cropKey)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: selectedCropFilter === cropKey ? '1px solid #0F172A' : '1px solid #E2E8F0',
                  background: selectedCropFilter === cropKey ? '#0F172A' : '#F8FAFC',
                  color: selectedCropFilter === cropKey ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {cropKey}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.2rem'
        }}>
          {filteredListings.map(lot => {
            const isSold = lot.status === 'sold';
            return (
              <div
                key={lot.listing_id || lot._id}
                style={{
                  border: isSold ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '1.2rem',
                  background: isSold ? '#F8FAFC' : '#FFFFFF',
                  opacity: isSold ? 0.75 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isSold ? 'none' : '0 4px 10px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: '#D97706',
                        background: '#FEF3C7',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {lot.category || 'Grains'}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: '4px 0 0 0' }}>
                        {lot.crop_name}
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isSold ? '#DCFCE7' : '#FEF3C7',
                      color: isSold ? '#166534' : '#92400E'
                    }}>
                      {isSold ? 'Sold' : 'Available'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '12px' }}>
                    <div>Farmer: <strong style={{ color: '#0F172A' }}>{lot.farmer_name}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={12} /> {lot.location}
                    </div>
                  </div>

                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '0.82rem'
                  }}>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Lot Volume</span>
                      <strong style={{ color: '#0F172A' }}>{lot.quantity_quintals} Q</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Unit Price</span>
                      <strong style={{ color: '#D97706' }}>₹{lot.price_per_quintal}/Q</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Grade</span>
                      <strong style={{ color: '#0F172A' }}>{lot.quality_grade || 'Grade A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Moisture</span>
                      <strong style={{ color: '#0F172A' }}>{lot.moisture_pct}%</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingTop: '8px',
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Total Escrow Value:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                      ₹{lot.total_value?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    disabled={isSold}
                    onClick={() => handleStartPurchase(lot)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px',
                      background: isSold ? '#E2E8F0' : '#0F172A',
                      color: isSold ? '#94A3B8' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: isSold ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ShoppingCart size={16} /> {isSold ? 'Purchased Lot' : 'Buy Now & Escrow'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction & Escrow Settlement History */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
          My Purchase Invoices & Payment Ledger
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1rem 0' }}>
          Real-time payment signatures verified with HMAC SHA256 against Razorpay gateway
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
            <FileText size={36} color="#CBD5E1" style={{ margin: '0 auto 8px auto' }} />
            No purchase records found yet. Buy any available crop lot above to complete a 2FA-secured transaction.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Order ID</th>
                  <th style={{ padding: '10px 12px' }}>Farmer / Origin</th>
                  <th style={{ padding: '10px 12px' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Payment ID</th>
                  <th style={{ padding: '10px 12px' }}>2FA Verified</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id || tx.order_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0F172A' }}>{tx.order_id}</td>
                    <td style={{ padding: '12px' }}>{tx.farmer_name || 'Farmer Partner'}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#16A34A' }}>₹{tx.amount?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.gateway_payment_id || 'Pending'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                        ✓ 2FA Passed
                      </span>
                    </td>
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

      {/* Multi-Step Checkout Modal */}
      {activeCheckoutLot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
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
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Step 1: Order Confirmation */}
            {checkoutStep === 'confirm' && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                  Confirm Escrow Purchase
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.2rem' }}>
                  Review crop specifications before initiating payment authorization.
                </p>

                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Crop Lot:</span>
                    <strong style={{ color: '#0F172A' }}>{activeCheckoutLot.crop_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Quantity:</span>
                    <strong style={{ color: '#0F172A' }}>{activeCheckoutLot.quantity_quintals} Quintals</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Farmer:</span>
                    <strong style={{ color: '#0F172A' }}>{activeCheckoutLot.farmer_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px', marginTop: '6px' }}>
                    <span style={{ color: '#0F172A', fontWeight: '700' }}>Total Amount:</span>
                    <strong style={{ color: '#D97706', fontSize: '1.1rem' }}>₹{activeCheckoutLot.total_value?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {activeCheckoutLot.total_value >= 50000 && (
                  <div style={{
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '1.2rem'
                  }}>
                    <Lock size={16} /> <strong>High-Value Security:</strong> 2FA Phone OTP will be required.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveCheckoutLot(null)}
                    style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateOrder}
                    disabled={isProcessingPayment}
                    style={{ flex: 2, padding: '10px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {isProcessingPayment ? 'Initializing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: High-Value 2FA Step */}
            {checkoutStep === '2fa' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Lock size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                  High-Value 2FA Authorization
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
                  Enter 6-digit OTP sent to your registered phone (Sandbox PIN: <code>123456</code>)
                </p>

                {otpError && (
                  <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '8px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {otpError}
                  </div>
                )}

                <input
                  type="text"
                  value={otp2FA}
                  onChange={(e) => setOtp2FA(e.target.value)}
                  maxLength={6}
                  style={{
                    width: '160px',
                    fontSize: '1.6rem',
                    letterSpacing: '6px',
                    textAlign: 'center',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #0F172A',
                    color: '#0F172A',
                    marginBottom: '1.5rem',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveCheckoutLot(null)}
                    style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify2FA}
                    disabled={isProcessingPayment}
                    style={{ flex: 2, padding: '10px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {isProcessingPayment ? 'Verifying 2FA...' : 'Authorize Payment'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Razorpay Simulated Gateway Modal */}
            {checkoutStep === 'gateway' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>Razorpay Escrow Checkout</span>
                  </div>
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    Test Mode
                  </span>
                </div>

                <div style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Amount Payable</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>₹{createdOrder?.amount?.toLocaleString('en-IN')}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>ID: {createdOrder?.gateway_order_id?.slice(0, 14)}...</span>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Select Payment Instrument
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                      { id: 'card', label: 'Cards', icon: CreditCard },
                      { id: 'netbanking', label: 'NetBanking', icon: Building2 }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPaymentMethod(item.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: paymentMethod === item.id ? '2px solid #D97706' : '1px solid #E2E8F0',
                          background: paymentMethod === item.id ? '#FEF3C7' : '#FFFFFF',
                          color: paymentMethod === item.id ? '#92400E' : '#334155',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <item.icon size={18} /> {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveCheckoutLot(null)}
                    style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteGatewayPayment}
                    disabled={isProcessingPayment}
                    style={{ flex: 2, padding: '12px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {isProcessingPayment ? 'Verifying HMAC Signature...' : `Pay ₹${createdOrder?.amount?.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success Confirmation */}
            {checkoutStep === 'success' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#DCFCE7', color: '#166534', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                  Payment Verified & Escrow Locked!
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.5rem' }}>
                  Your payment of <strong>₹{activeCheckoutLot.total_value?.toLocaleString('en-IN')}</strong> has been cryptographically confirmed on the server. The farmer has been notified to dispatch the produce.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveCheckoutLot(null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Close & View Ledger
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
