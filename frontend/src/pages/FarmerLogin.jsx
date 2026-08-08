import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Phone, Lock, ArrowLeft, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FarmerLogin() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password, 'farmer');
      navigate('/dashboard/farmer');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoFill = () => {
    setIdentifier('9876543210');
    setPassword('FarmerPass123');
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '2px solid #FDE68A',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        padding: '2.2rem',
        boxShadow: '0 8px 24px rgba(217, 119, 6, 0.08)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/auth/role')}
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
            <ArrowLeft size={16} /> Switch Portal
          </button>
          <span style={{
            fontSize: '0.78rem',
            background: '#FEF3C7',
            color: '#92400E',
            padding: '3px 10px',
            borderRadius: '999px',
            fontWeight: '700'
          }}>
            Farmer Portal
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
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
            Farmer Login / शेतकरी लॉगिन
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
            Enter your mobile number to access your mandi dashboard
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Registered Mobile Number / मोबाईल नंबर
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="tel"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  background: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Password / पासवर्ड
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  background: '#FFFFFF',
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
              opacity: loading ? 0.7 : 1,
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #F1F5F9',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: '#64748B'
        }}>
          New farmer on AgriPulse?{' '}
          <Link to="/auth/farmer/signup" style={{ color: '#D97706', fontWeight: '700', textDecoration: 'none' }}>
            Register as Farmer
          </Link>
        </div>

        {/* Pre-seeded Test Account Info Box */}
        <div style={{
          marginTop: '1rem',
          padding: '12px',
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: '#166534'
        }}>
          <div style={{ fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ✅ Ready-to-use Test Account
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <span style={{ color: '#64748B' }}>Phone:</span>
            <strong>9800000001</strong>
            <span style={{ color: '#64748B' }}>Password:</span>
            <strong>Farmer@123</strong>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            style={{
              width: '100%',
              marginTop: '8px',
              background: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '7px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ⚡ Fill & Login as Ramesh Patil (Test Farmer)
          </button>
        </div>
      </div>
    </div>
  );
}
