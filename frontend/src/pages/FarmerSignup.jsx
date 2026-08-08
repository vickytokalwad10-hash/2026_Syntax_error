import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Phone, User, MapPin, Lock, Shield, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_CROPS = [
  'Wheat (गहू)', 'Soybean (सोयाबीन)', 'Red Onion (कांदा)', 'Basmati Rice (तांदूळ)',
  'Cotton (कापूस)', 'Maize (मका)', 'Tomato (टमाटर)', 'Gram / Chana (हरभरा)',
  'Tur / Arhar (तूर)', 'Sugarcane (ऊस)', 'Mustard (मोहरी)', 'Garlic (लसूण)'
];

export default function FarmerSignup() {
  const navigate = useNavigate();
  const { signupFarmer, sendOTP, verifyOTP, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village_district: '',
    crops_grown: ['Wheat (गहू)', 'Soybean (सोयाबीन)'],
    aadhar_id: '',
    password: ''
  });

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [otpError, setOtpError] = useState('');
  const [error, setError] = useState('');

  const toggleCrop = (crop) => {
    setFormData(prev => {
      const exists = prev.crops_grown.includes(crop);
      if (exists) {
        return { ...prev, crops_grown: prev.crops_grown.filter(c => c !== crop) };
      } else {
        return { ...prev, crops_grown: [...prev.crops_grown, crop] };
      }
    });
  };

  const handleInitiateSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (formData.crops_grown.length === 0) {
      setError('Please select at least one cultivated crop');
      return;
    }

    try {
      await sendOTP(formData.phone, 'signup');
      setShowOtpModal(true);
    } catch (err) {
      setError(err.message || 'Failed to trigger phone OTP');
    }
  };

  const handleVerifyAndComplete = async () => {
    setOtpError('');
    try {
      await verifyOTP(formData.phone, otpCode, 'signup');
      await signupFarmer(formData);
      navigate('/dashboard/farmer');
    } catch (err) {
      setOtpError(err.message || 'OTP verification failed');
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '2px solid #FDE68A',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        padding: '2.2rem',
        boxShadow: '0 8px 24px rgba(217, 119, 6, 0.08)'
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <button
            onClick={() => navigate('/auth/farmer/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <ArrowLeft size={16} /> Back to Login
          </button>
          <span style={{
            fontSize: '0.78rem',
            background: '#FEF3C7',
            color: '#92400E',
            padding: '3px 10px',
            borderRadius: '999px',
            fontWeight: '700'
          }}>
            Farmer Registration
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: '#FEF3C7',
            color: '#D97706',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Sprout size={30} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
            Farmer Account / शेतकरी नोंदणी
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
            Connect directly with verified buyers and maximize harvest profits
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#DC2626',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleInitiateSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Full Name / पूर्ण नाव *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Devidas Patil"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.92rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Mobile Number (OTP Verification) / मोबाईल नंबर *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.92rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Village / District */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Village & District / गाव आणि जिल्हा *
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="text"
                value={formData.village_district}
                onChange={(e) => setFormData({ ...formData, village_district: e.target.value })}
                placeholder="e.g. Dindori, Nashik (Maharashtra)"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.92rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Crops Grown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Crops You Cultivate / तुम्ही पिकवणारी पिके *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {AVAILABLE_CROPS.map(crop => {
                const selected = formData.crops_grown.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => toggleCrop(crop)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      border: selected ? '1px solid #D97706' : '1px solid #E2E8F0',
                      background: selected ? '#FEF3C7' : '#F8FAFC',
                      color: selected ? '#92400E' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {selected && '✓ '} {crop}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aadhar / Kisan ID */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Aadhar / Kisan ID (Optional) / आधार क्रमांक
            </label>
            <div style={{ position: 'relative' }}>
              <Shield size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="text"
                value={formData.aadhar_id}
                onChange={(e) => setFormData({ ...formData, aadhar_id: e.target.value })}
                placeholder="XXXX-XXXX-XXXX"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.92rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Create Password / पासवर्ड तयार करा *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.92rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              background: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
          >
            Verify Phone & Register <ArrowRight size={18} />
          </button>
        </form>

        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #F1F5F9',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: '#64748B'
        }}>
          Already have a farmer account?{' '}
          <Link to="/auth/farmer/login" style={{ color: '#D97706', fontWeight: '700', textDecoration: 'none' }}>
            Log in here
          </Link>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
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
            maxWidth: '400px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
              Verify Mobile OTP
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.5rem' }}>
              Enter 6-digit OTP sent to <strong>{formData.phone}</strong> (Sandbox PIN: <code>123456</code>)
            </p>

            {otpError && (
              <div style={{
                background: '#FEF2F2',
                color: '#DC2626',
                padding: '8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {otpError}
              </div>
            )}

            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              style={{
                width: '160px',
                fontSize: '1.6rem',
                letterSpacing: '6px',
                textAlign: 'center',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #D97706',
                color: '#0F172A',
                marginBottom: '1.5rem',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyAndComplete}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '10px',
                  background: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Verifying...' : 'Complete Signup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
