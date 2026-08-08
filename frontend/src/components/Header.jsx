import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Globe, Activity, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const TICKER_ITEMS = [
  { name: 'Wheat Sharbati', price: '₹2,840/Q', change: '+2.4%', up: true },
  { name: 'Basmati Paddy', price: '₹3,950/Q', change: '-0.8%', up: false },
  { name: 'Cotton Med', price: '₹7,420/Q', change: '+3.1%', up: true },
  { name: 'Soybean Yellow', price: '₹4,890/Q', change: '+1.7%', up: true },
  { name: 'Mustard Seed', price: '₹5,780/Q', change: '+1.2%', up: true },
  { name: 'Nashik Onion', price: '₹2,150/Q', change: '-4.2%', up: false },
  { name: 'Hybrid Tomato', price: '₹1,820/Q', change: '+5.6%', up: true },
  { name: 'Potato Jyoti', price: '₹1,460/Q', change: '-0.4%', up: false },
  { name: 'Crude Brent', price: '$78.40/bbl', change: '+1.2%', up: true },
  { name: 'Monsoon Anomaly', price: '+4.2% Normal', change: 'Surplus', up: true },
];

export default function Header({ language, setLanguage }) {
  const navigate = useNavigate();
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    const check = async () => {
      const ok = await api.checkHealth();
      setBackendOnline(ok);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{ width: '100%' }}>
      {/* Real-time Commodity Ticker Tape */}
      <div className="ticker-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-moss-green-light)', fontWeight: '700' }}>
          <Activity size={14} />
          <span>MANDI TICKER:</span>
        </div>
        {TICKER_ITEMS.map((item, idx) => (
          <div key={idx} className="ticker-item">
            <span style={{ color: 'var(--color-beige)', fontWeight: '600' }}>{item.name}</span>
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
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-beige)' }}>
            Agricultural Decision Matrix & Prediction
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            AI Spot Arbitrage • Remote Sensing Canopy Analytics • Climate Shock Simulations
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
              {backendOnline ? 'FastAPI 8000 Live' : 'Connecting Engine...'}
            </span>
          </div>

          {/* Bilingual Toggle */}
          <button 
            className="btn-secondary"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            style={{ fontSize: '0.85rem', padding: '7px 14px' }}
          >
            <Globe size={15} color="var(--color-moss-green-light)" />
            <span>{language === 'en' ? 'हिंदी (Hindi)' : 'English'}</span>
          </button>

          {/* AI Voice Copilot Quick Trigger */}
          <button 
            className="btn-primary"
            onClick={() => navigate('/copilot')}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <Mic size={16} />
            <span>Ask Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
}
