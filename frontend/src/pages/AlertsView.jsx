import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  MapPin, 
  Sparkles, 
  CloudRain, 
  TrendingUp, 
  FileText, 
  Bug, 
  CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';

export default function AlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.getAlerts();
      if (res && res.alerts) {
        setAlerts(res.alerts);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    const matchSev = severityFilter === 'ALL' || a.severity.toUpperCase() === severityFilter;
    const matchCat = categoryFilter === 'ALL' || a.category.toUpperCase().includes(categoryFilter);
    return matchSev && matchCat;
  });

  const getCategoryIcon = (cat) => {
    if (cat.includes('Weather')) return CloudRain;
    if (cat.includes('Price')) return TrendingUp;
    if (cat.includes('Policy')) return FileText;
    if (cat.includes('Pest')) return Bug;
    return Info;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Filter Controls */}
      <div className="agri-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Bell size={18} color="var(--color-rosy-brown-light)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>
                Real-Time Volatility, Weather Shock & Policy Alerts
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Automated anomaly detection across IMD Doppler radars, Sentinel-2 spectral indices, and 2,800+ APMC mandis.
            </p>
          </div>

          {/* Severity Counters */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-rose" style={{ padding: '6px 12px' }}>
              {alerts.filter(a => a.severity === 'Critical').length} Critical
            </span>
            <span className="badge badge-midnight" style={{ padding: '6px 12px' }}>
              {alerts.filter(a => a.severity === 'Warning').length} Warnings
            </span>
            <span className="badge badge-moss" style={{ padding: '6px 12px' }}>
              {alerts.filter(a => a.severity === 'Advisory').length} Advisories
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid rgba(131, 153, 88, 0.2)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SEVERITY:</span>
            {['ALL', 'CRITICAL', 'WARNING', 'ADVISORY'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={severityFilter === s ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '5px 12px', fontSize: '0.75rem' }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CATEGORY:</span>
            {['ALL', 'WEATHER', 'PRICE', 'POLICY', 'PEST'].map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={categoryFilter === c ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '5px 12px', fontSize: '0.75rem' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAlerts.map((alt) => {
          const Icon = getCategoryIcon(alt.category);
          const isCritical = alt.severity === 'Critical';
          return (
            <div 
              key={alt.id} 
              className="agri-card"
              style={{ 
                borderLeft: `5px solid ${isCritical ? 'var(--color-rosy-brown)' : (alt.severity === 'Warning' ? '#E8C172' : 'var(--color-moss-green)')}`,
                padding: '22px 26px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: isCritical ? 'rgba(211, 150, 140, 0.2)' : 'rgba(16, 86, 102, 0.3)',
                    color: isCritical ? 'var(--color-rosy-brown-light)' : 'var(--color-moss-green-light)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-beige)' }}>
                      {alt.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <span className={`badge ${isCritical ? 'badge-rose' : (alt.severity === 'Warning' ? 'badge-midnight' : 'badge-moss')}`}>
                        {alt.severity}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {alt.category} • {alt.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {alt.impacted_crops.map((c, idx) => (
                    <span key={idx} className="badge badge-dark" style={{ fontSize: '0.72rem' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metric Trigger & Details */}
              <div style={{ background: 'rgba(5, 28, 19, 0.7)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.15)', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-moss-green-light)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Trigger Diagnostic: {alt.metric_trigger}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {alt.details}
                </p>
              </div>

              {/* Action Required Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(10, 51, 35, 0.8)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.3)' }}>
                <CheckCircle2 size={18} color="var(--color-moss-green-light)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--color-beige)' }}>
                  <strong>Prescribed Action:</strong> {alt.action_required}
                </div>
              </div>

              {/* Regions Affected Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <MapPin size={13} color="var(--color-rosy-brown)" />
                <span>Affected Geography: {alt.affected_regions.join(' • ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
