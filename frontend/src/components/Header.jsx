import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Globe, Activity, TrendingUp, TrendingDown, ChevronDown, Check } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const TICKER_ITEMS = [
  { name: 'Wheat Sharbati', mr: 'शरबती गहू', price: '₹2,840/Q', change: '+2.4%', up: true },
  { name: 'Basmati Paddy', mr: 'बासमती धान', price: '₹3,950/Q', change: '-0.8%', up: false },
  { name: 'Cotton Shankar-6', mr: 'शंकर-६ कापूस', price: '₹7,420/Q', change: '+3.1%', up: true },
  { name: 'Soybean Yellow', mr: 'पिवळा सोयाबीन', price: '₹4,890/Q', change: '+1.7%', up: true },
  { name: 'Mustard Seed', mr: 'मोहरी/राई', price: '₹5,780/Q', change: '+1.2%', up: true },
  { name: 'Nashik Onion', mr: 'नाशिक कांदा', price: '₹2,150/Q', change: '-4.2%', up: false },
  { name: 'Hybrid Tomato', mr: 'टोमॅटो', price: '₹1,820/Q', change: '+5.6%', up: true },
  { name: 'Potato Jyoti', mr: 'ज्योती बटाटा', price: '₹1,460/Q', change: '-0.4%', up: false },
  { name: 'Crude Brent', mr: 'कच्चे तेल', price: '$78.40/bbl', change: '+1.2%', up: true },
  { name: 'Monsoon Anomaly', mr: 'मान्सून स्थिती', price: '+4.2% Normal', change: 'Surplus', up: true },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-moss-green-light)', fontWeight: '700' }}>
          <Activity size={14} />
          <span>{t('mandiTicker')}</span>
        </div>
        {TICKER_ITEMS.map((item, idx) => (
          <div key={idx} className="ticker-item">
            <span style={{ color: 'var(--color-beige)', fontWeight: '600' }}>
              {language === 'mr' ? item.mr : item.name}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>{item.price}</span>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              color: item.up ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)' 
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
          <h1 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-beige)' }}>
            {t('headerTitle')}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('headerSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Backend Status Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: 'var(--radius-full)', 
            background: backendOnline ? 'rgba(131, 153, 88, 0.2)' : 'rgba(211, 150, 140, 0.2)',
            border: `1px solid ${backendOnline ? 'var(--color-moss-green)' : 'var(--color-rosy-brown)'}`
          }}>
            <div className={backendOnline ? "pulse-dot" : "pulse-dot-rose"} />
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: backendOnline ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)' }}>
              {backendOnline ? t('fastApiLive') : t('connectingEngine')}
            </span>
          </div>

          {/* Regional Multi-Language Selector Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              className="btn-secondary"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              style={{ 
                fontSize: '0.85rem', 
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 86, 102, 0.4)',
                borderColor: 'var(--color-sea-green)'
              }}
            >
              <Globe size={15} color="var(--color-moss-green-light)" />
              <span style={{ fontWeight: '700', color: 'var(--color-beige)' }}>
                {currentLanguageObj.native} ({currentLanguageObj.name})
              </span>
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: langMenuOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {langMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#072418',
                border: '1px solid rgba(131, 153, 88, 0.4)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                zIndex: 1000,
                minWidth: '220px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
              }}>
                <div style={{ 
                  padding: '6px 10px', 
                  fontSize: '0.7rem', 
                  color: 'var(--text-muted)', 
                  fontWeight: '700', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid rgba(131, 153, 88, 0.15)'
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
                        padding: '8px 12px',
                        background: isSelected ? 'rgba(131, 153, 88, 0.25)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: isSelected ? 'var(--color-moss-green-light)' : 'var(--color-beige)',
                        fontSize: '0.88rem',
                        fontWeight: isSelected ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1rem' }}>{lang.native}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({lang.name})</span>
                      </div>
                      {isSelected && <Check size={14} color="var(--color-moss-green-light)" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Voice Copilot Quick Trigger */}
          <button 
            className="btn-primary"
            onClick={() => navigate('/copilot')}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <Mic size={16} />
            <span>{t('askCopilot')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
