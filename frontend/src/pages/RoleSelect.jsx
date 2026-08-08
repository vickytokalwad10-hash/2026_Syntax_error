import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Building2, ShieldCheck, ArrowRight, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RoleSelect() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '640px', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          background: '#FEF3C7',
          color: '#92400E',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '1rem',
          border: '1px solid #FDE68A'
        }}>
          <Sparkles size={16} /> Role-Based Agricultural Platform
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Choose Your Portal
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.5 }}>
          Select your role to access tailored market tools, direct contract farming, AI agronomy advice, and secured payment escrow.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '2rem',
        width: '100%',
        maxWidth: '840px'
      }}>
        {/* Farmer Portal Card */}
        <div
          onClick={() => navigate('/auth/farmer/login')}
          style={{
            background: '#FFFFFF',
            border: '2px solid #FCD34D',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(217, 119, 6, 0.16)';
            e.currentTarget.style.borderColor = '#D97706';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.08)';
            e.currentTarget.style.borderColor = '#FCD34D';
          }}
        >
          <div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Sprout size={32} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Farmer Portal
              </h2>
              <span style={{ fontSize: '0.8rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                किसान / शेतकरी
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              List your harvested crops, discover optimal mandi arbitrage routes, receive direct buyer bids, and get real-time AI crop advisory.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <TrendingUp size={16} color="#D97706" /> Instant Mandi Price Predictions
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <DollarSign size={16} color="#16A34A" /> Direct-to-Buyer Escrow Payments
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <Sparkles size={16} color="#D97706" /> Multilingual AI Voice Copilot
              </div>
            </div>
          </div>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px',
            background: '#D97706',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}>
            Continue as Farmer <ArrowRight size={18} />
          </button>
        </div>

        {/* Buyer Portal Card */}
        <div
          onClick={() => navigate('/auth/buyer/login')}
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.12)';
            e.currentTarget.style.borderColor = '#0F172A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.06)';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#F1F5F9',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Building2 size={32} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Buyer Portal
              </h2>
              <span style={{ fontSize: '0.8rem', background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                व्यापारी / Institutional
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              Procure directly from certified farm clusters, execute 2FA-secured bulk payments, and track satellite moisture & grade metrics.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <ShieldCheck size={16} color="#0F172A" /> Verified Farm Quality Grades
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <DollarSign size={16} color="#16A34A" /> 2FA-Protected Razorpay Checkout
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                <Building2 size={16} color="#0F172A" /> GST-Compliant Bulk Invoicing
              </div>
            </div>
          </div>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px',
            background: '#0F172A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}>
            Continue as Buyer <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
