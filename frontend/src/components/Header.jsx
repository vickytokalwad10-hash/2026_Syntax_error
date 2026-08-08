import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Globe, Activity, TrendingUp, TrendingDown, ChevronDown, Check } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const TICKER_COMMODITIES = [
  { key: 'wheat', price: '₹2,840/Q', change: '+2.4%', up: true },
  { key: 'rice', price: '₹3,950/Q', change: '-0.8%', up: false },
  { key: 'cotton', price: '₹7,420/Q', change: '+3.1%', up: true },
  { key: 'soybean', price: '₹4,890/Q', change: '+1.7%', up: true },
  { key: 'mustard', price: '₹5,780/Q', change: '+1.2%', up: true },
  { key: 'onion', price: '₹2,150/Q', change: '-4.2%', up: false },
  { key: 'tomato', price: '₹1,820/Q', change: '+5.6%', up: true },
  { key: 'potato', price: '₹1,460/Q', change: '-0.4%', up: false },
];

export default function Header() {
  const navigate = useNavigate();
  const { language, setLanguage, t, languages, currentLanguageObj } = useLanguage();
  const [backendOnline, setBackendOnline] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const check = async () => {
      const ok = await api.checkHealth();
      setBackendOnline(ok);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{ width: '100%', position: 'relative' }}>
      {/* Real-time Commodity Ticker Tape */}
      <div className="ticker-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontWeight: '700' }}>
          <Activity size={14} />
          <span>{t('mandiTicker')}</span>
        </div>
        {TICKER_COMMODITIES.map((item, idx) => (
          <div key={idx} className="ticker-item">
            <span style={{ color: '#0F172A', fontWeight: '600' }}>
              {t(item.key)}
            </span>
            <span style={{ color: '#334155' }}>{item.price}</span>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              color: item.up ? '#059669' : '#DC2626' 
            }}>
              {item.up ? <TrendingUp size={12} style={{ marginRight: '2px' }} /> : <TrendingDown size={12} style={{ marginRight: '2px' }} />}
              {item.change}
            </span>
          </div>
        ))}
      </div>

      {/* Main Header Controls */}
      <div className="header-bar">
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0F172A' }}>
            {t('headerTitle')}
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
            {t('headerSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Backend Status Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '5px 10px', 
            borderRadius: '4px', 
            background: '#F8FAFC',
            border: `1px solid ${backendOnline ? '#FCD34D' : '#FCA5A5'}`
          }}>
            <div className={backendOnline ? "pulse-dot" : "pulse-dot-rose"} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: backendOnline ? '#92400E' : '#991B1B' }}>
              {backendOnline ? t('fastApiLive') : t('connectingEngine')}
            </span>
          </div>

          {/* Regional Multi-Language Selector Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              className="btn-secondary"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              style={{ 
                fontSize: '0.82rem', 
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                borderColor: '#CBD5E1',
                color: '#0F172A'
              }}
            >
              <Globe size={14} color="#D97706" />
              <span style={{ fontWeight: '700', color: '#0F172A' }}>
                {currentLanguageObj.native} ({currentLanguageObj.name})
              </span>
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: langMenuOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {langMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '220px',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <div style={{ 
                  padding: '6px 10px', 
                  fontSize: '0.7rem', 
                  color: '#64748B', 
                  fontWeight: '700', 
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #E2E8F0'
                }}>
                  {t('selectLanguage')}
                </div>
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        background: isSelected ? '#FEF3C7' : 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        color: isSelected ? '#92400E' : '#0F172A',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{lang.native}</span>
                        <span style={{ fontSize: '0.72rem', color: isSelected ? '#92400E' : '#64748B' }}>({lang.name})</span>
                      </div>
                      {isSelected && <Check size={14} color="#92400E" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Voice AI Trigger Button */}
          <button 
            className="btn-primary" 
            onClick={() => navigate('/copilot')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.82rem',
              padding: '6px 12px'
            }}
          >
            <Mic size={14} />
            <span>{t('aiVoiceCopilot')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
