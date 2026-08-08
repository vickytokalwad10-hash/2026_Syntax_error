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
  { path: '/direct-market', key: 'directMarket', icon: ShoppingBag, badge: '0% Fee', badgeType: 'yellow' },
  { path: '/weather', key: 'weather', icon: CloudSun, badge: 'Radar', badgeType: 'yellow' },
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid #2D3A4F' }}>
        <div style={{ 
          width: '38px', 
          height: '38px', 
          borderRadius: '8px', 
          background: '#FACC15', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
        }}>
          <Sprout size={22} color="#000000" />
        </div>
        <div className="logo-text">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', lineHeight: 1.1, color: '#FFFFFF' }}>
            AgriPulse <span style={{ color: '#FACC15' }}>AI</span>
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Decision Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
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
                padding: '10px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: isActive ? '#000000' : '#FFFFFF',
                backgroundColor: isActive ? '#FACC15' : 'transparent',
                fontWeight: isActive ? '700' : '500',
                transition: 'background-color 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={item.badgeType === 'rose' ? '#EF4444' : 'currentColor'} />
                <span className="nav-text" style={{ fontSize: '0.9rem' }}>{t(item.key)}</span>
              </div>
              {item.badge && (
                <span 
                  className={`badge ${item.badgeType === 'rose' ? 'badge-rose' : 'badge-yellow'} nav-text`}
                  style={{ fontSize: '0.65rem', padding: '2px 6px' }}
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
        padding: '12px', 
        borderRadius: '6px', 
        background: '#1E293B', 
        border: '1px solid #2D3A4F' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FACC15', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sentinel-2 Live
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
          {currentLanguageObj.native} Active • 2,847 APMCs
        </div>
      </div>
    </aside>
  );
}
