import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  SlidersHorizontal, 
  Store, 
  TrendingUp, 
  Bell, 
  Mic, 
  Sprout, 
  ShoppingBag,
  CloudSun
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NAV_ITEMS = [
  { path: '/overview', key: 'overview', icon: LayoutDashboard, badge: 'Live' },
  { path: '/direct-market', key: 'directMarket', icon: ShoppingBag, badge: '0% Fee', badgeType: 'moss' },
  { path: '/weather', key: 'weather', icon: CloudSun, badge: 'Radar', badgeType: 'moss' },
  { path: '/heatmap', key: 'heatmap', icon: Map, badge: 'NDVI' },
  { path: '/what-if', key: 'whatIf', icon: SlidersHorizontal },
  { path: '/markets', key: 'markets', icon: Store, badge: 'Arbitrage' },
  { path: '/trends', key: 'trends', icon: TrendingUp, badge: '30-Day' },
  { path: '/alerts', key: 'alerts', icon: Bell, badge: '2 New', badgeType: 'rose' },
  { path: '/copilot', key: 'copilot', icon: Mic, badge: 'AI Voice' },
  { path: '/crop-health', key: 'cropHealth', icon: Sprout, badge: '10m' },
];

export default function Sidebar() {
  const { t, currentLanguageObj } = useLanguage();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--border-card)' }}>
        <div style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #839958 0%, #105666 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(131, 153, 88, 0.4)'
        }}>
          <Sprout size={24} color="#F7F4D5" />
        </div>
        <div className="logo-text">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.1, color: 'var(--color-beige)' }}>
            AgriPulse <span style={{ color: 'var(--color-moss-green-light)' }}>AI</span>
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Decision Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                color: isActive ? 'var(--color-beige)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(131, 153, 88, 0.25)' : 'transparent',
                border: isActive ? '1px solid var(--color-moss-green)' : '1px solid transparent',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 14px rgba(131, 153, 88, 0.2)' : 'none'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={19} color={item.badgeType === 'rose' ? 'var(--color-rosy-brown)' : 'currentColor'} />
                <span className="nav-text" style={{ fontSize: '0.92rem' }}>{t(item.key)}</span>
              </div>
              {item.badge && (
                <span 
                  className={`badge ${item.badgeType === 'rose' ? 'badge-rose' : 'badge-moss'} nav-text`}
                  style={{ fontSize: '0.65rem', padding: '2px 7px' }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Status Card Footer */}
      <div style={{ 
        marginTop: 'auto', 
        padding: '14px', 
        borderRadius: 'var(--radius-sm)', 
        background: 'rgba(5, 28, 19, 0.8)', 
        border: '1px solid rgba(131, 153, 88, 0.2)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-moss-green-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sentinel-2 MSI Live
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {currentLanguageObj.native} Mode Active • 2,847 APMCs
        </div>
      </div>
    </aside>
  );
}
