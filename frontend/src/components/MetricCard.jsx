import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, unit, delta, isPositive, subtext, icon: Icon, tag }) {
  return (
    <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          {tag && (
            <span className="badge badge-yellow" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
              {tag}
            </span>
          )}
        </div>
        {Icon && (
          <div style={{ 
            padding: '6px', 
            borderRadius: '6px', 
            background: '#FEF3C7', 
            color: '#D97706',
            border: '1px solid #FCD34D'
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.7rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0F172A' }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>{unit}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
        {delta && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            color: isPositive ? '#059669' : '#DC2626',
            fontWeight: '700'
          }}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{delta}</span>
          </div>
        )}
        {subtext && <span style={{ color: '#64748B', fontWeight: '500' }}>{subtext}</span>}
      </div>
    </div>
  );
}
