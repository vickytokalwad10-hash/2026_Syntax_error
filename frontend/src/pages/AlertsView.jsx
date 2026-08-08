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
import { useLanguage } from '../context/LanguageContext';

export default function AlertsView() {
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.getAlerts();
      if (res && res.alerts && res.alerts.length > 0) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Filter Controls */}
      <div className="agri-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Bell size={18} color="#D97706" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                {t('alertsTitle')}
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Automated anomaly detection across IMD Doppler radars, Sentinel-2 spectral indices, and 2,800+ APMC mandis.
            </p>
          </div>

          {/* Severity Counters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-rose" style={{ padding: '5px 10px' }}>
              {alerts.filter(a => a.severity === 'Critical').length} Critical
            </span>
            <span className="badge badge-yellow" style={{ padding: '5px 10px' }}>
              {alerts.filter(a => a.severity === 'Warning').length} Warnings
            </span>
            <span className="badge badge-white" style={{ padding: '5px 10px' }}>
              {alerts.filter(a => a.severity === 'Advisory').length} Advisories
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>SEVERITY:</span>
            {['ALL', 'CRITICAL', 'WARNING', 'ADVISORY'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={severityFilter === s ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>CATEGORY:</span>
            {['ALL', 'WEATHER', 'PRICE', 'POLICY', 'PEST'].map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={categoryFilter === c ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAlerts.map((alt) => {
          const Icon = getCategoryIcon(alt.category);
          const isCritical = alt.severity === 'Critical';
          return (
            <div 
              key={alt.id} 
              className="agri-card"
              style={{ 
                borderLeft: `4px solid ${isCritical ? '#DC2626' : (alt.severity === 'Warning' ? '#D97706' : '#2563EB')}`,
                padding: '18px 22px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '6px', 
                    background: isCritical ? '#FEE2E2' : '#FEF3C7',
                    color: isCritical ? '#DC2626' : '#D97706'
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>
                      {alt.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                      <span className={`badge ${isCritical ? 'badge-rose' : (alt.severity === 'Warning' ? 'badge-yellow' : 'badge-white')}`}>
                        {alt.severity}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {alt.category} • {alt.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {alt.impacted_crops.map((c, idx) => (
                    <span key={idx} className="badge badge-white" style={{ fontSize: '0.7rem' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metric Trigger & Details */}
              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                  Trigger Diagnostic: {alt.metric_trigger}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', margin: 0 }}>
                  {alt.details}
                </p>
              </div>

              {/* Action Required Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FFFBEB', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                <CheckCircle2 size={16} color="#D97706" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#92400E' }}>
                  <strong>Prescribed Action:</strong> {alt.action_required}
                </div>
              </div>

              {/* Regions Affected Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.75rem', color: '#64748B' }}>
                <MapPin size={12} color="#D97706" />
                <span>Affected Geography: {alt.affected_regions.join(' • ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
