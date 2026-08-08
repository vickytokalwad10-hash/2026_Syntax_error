import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, unit, delta, isPositive, subtext, icon: Icon, tag }) {
  return (
    <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          {tag && (
            <span className="badge badge-moss" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
              {tag}
            </span>
          )}
        </div>
        {Icon && (
          <div style={{ 
            padding: '8px', 
            borderRadius: 'var(--radius-sm)', 
            background: 'rgba(16, 86, 102, 0.3)', 
            color: 'var(--color-moss-green-light)',
            border: '1px solid rgba(131, 153, 88, 0.2)'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-beige)' }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{unit}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
        {delta && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            color: isPositive ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)',
            fontWeight: '700'
          }}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{delta}</span>
          </div>
        )}
        {subtext && <span style={{ color: 'var(--text-muted)' }}>{subtext}</span>}
      </div>
    </div>
  );
}
