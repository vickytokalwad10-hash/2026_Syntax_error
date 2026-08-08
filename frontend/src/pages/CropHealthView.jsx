import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  Sprout, 
  Satellite, 
  Droplets, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  FileText 
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CropHealthView() {
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.getCropHealth();
      if (res) {
        setData(res);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="pulse-dot" style={{ width: '20px', height: '20px' }} />
      </div>
    );
  }

  const timeLabels = data.time_series_observations.map(o => o.date);
  const timeSeriesChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'NDVI (Canopy Biomass)',
        data: data.time_series_observations.map(o => o.ndvi),
        borderColor: '#FACC15',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        borderWidth: 2.5,
        tension: 0.2,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'NDRE (Chlorophyll / Nitrogen)',
        data: data.time_series_observations.map(o => o.ndre),
        borderColor: '#FFFFFF',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        tension: 0.2,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'NDWI (Water Hydration Stress)',
        data: data.time_series_observations.map(o => o.ndwi),
        borderColor: '#94A3B8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 2,
        tension: 0.2,
        fill: false,
        pointRadius: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#FFFFFF', font: { family: 'Outfit', size: 12 } } },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#FFFFFF',
        bodyColor: '#FACC15',
        borderColor: '#374151',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: '#1E293B' },
        ticks: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 10 } }
      },
      y: {
        grid: { color: '#1E293B' },
        ticks: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 10 } }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Parcel Metadata Header Card */}
      <div className="agri-card" style={{ borderLeft: '5px solid #FACC15', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Satellite size={16} color="#FACC15" />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FACC15', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Copernicus Sentinel-2B MSI Multi-Spectral
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF' }}>
              {data.parcel_metadata.parcel_name}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px' }}>
              {t('cropType')}: <strong>{data.parcel_metadata.crop}</strong> • Growth Stage: <strong>{data.parcel_metadata.growth_stage}</strong> • Resolution: {data.parcel_metadata.spatial_resolution}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-yellow" style={{ marginBottom: '4px' }}>
              <CheckCircle2 size={13} /> Overpass Calibrated
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Last Satellite Pass: {data.parcel_metadata.last_satellite_overpass}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Spectral Vegetation Indices KPI Grid */}
      <div className="grid-4">
        <MetricCard
          title={t('ndviBiomass')}
          value={data.current_indices.ndvi.value}
          unit="/ 1.0"
          delta={data.current_indices.ndvi.rating}
          isPositive={true}
          subtext={`Ref: ${data.current_indices.ndvi.reference_range}`}
          icon={Sprout}
        />
        <MetricCard
          title={t('ndreChlorophyll')}
          value={data.current_indices.ndre.value}
          unit="/ 1.0"
          delta={data.current_indices.ndre.rating}
          isPositive={true}
          subtext={`Ref: ${data.current_indices.ndre.reference_range}`}
          icon={Activity}
        />
        <MetricCard
          title={t('ndwiMoisture')}
          value={data.current_indices.ndwi.value}
          unit="/ 1.0"
          delta={data.current_indices.ndwi.rating}
          isPositive={true}
          subtext={`Ref: ${data.current_indices.ndwi.reference_range}`}
          icon={Droplets}
        />
        <MetricCard
          title={t('saviSoilAdjusted')}
          value={data.current_indices.savi.value}
          unit="/ 1.0"
          delta={data.current_indices.savi.rating}
          isPositive={true}
          subtext={`Ref: ${data.current_indices.savi.reference_range}`}
          icon={Layers}
        />
      </div>

      {/* 90-Day Sentinel-2 Satellite Multi-Spectral Curves */}
      <div className="agri-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF' }}>
              90-Day Phenological Multi-Spectral Vegetation Curves
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              10-day orbital passes tracking leaf area expansion, chlorophyll buildup, and moisture absorption stages.
            </p>
          </div>
          <span className="badge badge-white">10-Day Cycle</span>
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <Line data={timeSeriesChartData} options={chartOptions} />
        </div>
      </div>

      {/* Zonation & Agronomic Prescription */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Field Zonation Breakdown */}
        <div className="agri-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Layers size={18} color="#FACC15" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF' }}>
              {t('parcelZonation')}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.canopy_zonation.map((z, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '12px 14px', 
                  background: '#1E293B', 
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>{z.zone}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                    Coverage: {z.area_pct}% • Vigor: {z.vigor}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FACC15' }}>
                    NDVI {z.ndvi}
                  </div>
                  <span className={`badge ${z.status.includes('Optimal') ? 'badge-yellow' : 'badge-rose'}`} style={{ fontSize: '0.65rem' }}>
                    {z.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Agronomic Brief */}
        <div className="agri-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileText size={18} color="#FACC15" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF' }}>
              {t('prescriptiveAdvisory')}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px 12px', background: '#1E293B', borderRadius: '4px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#FACC15', textTransform: 'uppercase' }}>Biomass Evaluation</div>
              <div style={{ fontSize: '0.82rem', color: '#FFFFFF', marginTop: '2px' }}>{data.actionable_agronomic_brief.biomass_assessment}</div>
            </div>

            <div style={{ padding: '10px 12px', background: '#1E293B', borderRadius: '4px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#FACC15', textTransform: 'uppercase' }}>Nitrogen / Chlorophyll Status</div>
              <div style={{ fontSize: '0.82rem', color: '#FFFFFF', marginTop: '2px' }}>{data.actionable_agronomic_brief.chlorophyll_status}</div>
            </div>

            <div style={{ padding: '10px 12px', background: '#1E293B', borderRadius: '4px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#FCA5A5', textTransform: 'uppercase' }}>Targeted Irrigation Prescription</div>
              <div style={{ fontSize: '0.82rem', color: '#FFFFFF', marginTop: '2px' }}>{data.actionable_agronomic_brief.irrigation_prescription}</div>
            </div>

            <div style={{ padding: '10px 12px', background: '#1E293B', borderRadius: '4px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#FACC15', textTransform: 'uppercase' }}>Disease & Pest Scouting</div>
              <div style={{ fontSize: '0.82rem', color: '#FFFFFF', marginTop: '2px' }}>{data.actionable_agronomic_brief.disease_scouting}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
