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
        <div className="pulse-dot" style={{ width: '24px', height: '24px' }} />
      </div>
    );
  }

  // Time-Series Observation Chart
  const timeLabels = data.time_series_observations.map(o => o.date);
  const timeSeriesChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'NDVI (Canopy Biomass)',
        data: data.time_series_observations.map(o => o.ndvi),
        borderColor: '#839958',
        backgroundColor: 'rgba(131, 153, 88, 0.15)',
        borderWidth: 2.5,
        tension: 0.35,
        fill: false,
        pointRadius: 4
      },
      {
        label: 'NDRE (Chlorophyll / Nitrogen)',
        data: data.time_series_observations.map(o => o.ndre),
        borderColor: '#105666',
        backgroundColor: 'rgba(16, 86, 102, 0.15)',
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'NDWI (Water Hydration Stress)',
        data: data.time_series_observations.map(o => o.ndwi),
        borderColor: '#D3968C',
        backgroundColor: 'rgba(211, 150, 140, 0.15)',
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 3
      }
    ]
  };

  // Spectral Reflectance Signature Chart
  const spectralChartData = {
    labels: data.spectral_signature.map(s => s.band.split(' ')[0]),
    datasets: [
      {
        label: 'Reflectance Percentage (%)',
        data: data.spectral_signature.map(s => s.reflectance_pct),
        backgroundColor: data.spectral_signature.map(s => {
          if (s.band.includes('NIR')) return '#839958';
          if (s.band.includes('Red Edge')) return '#A3BA76';
          if (s.band.includes('SWIR')) return '#105666';
          return '#D3968C';
        }),
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#F7F4D5', font: { family: 'Outfit', size: 12 } } },
      tooltip: {
        backgroundColor: '#0A3323',
        titleColor: '#F7F4D5',
        bodyColor: '#C8D6AF',
        borderColor: '#839958',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(131, 153, 88, 0.1)' },
        ticks: { color: '#8FA391', font: { family: 'Plus Jakarta Sans', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(131, 153, 88, 0.1)' },
        ticks: { color: '#8FA391', font: { family: 'Plus Jakarta Sans', size: 10 } }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Parcel Metadata Header Card */}
      <div className="agri-card-solid" style={{ borderLeft: '6px solid var(--color-moss-green-light)', padding: '24px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Satellite size={18} color="var(--color-moss-green-light)" />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-moss-green-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Copernicus Sentinel-2B MSI Multi-Spectral Processing
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-beige)' }}>
              {data.parcel_metadata.parcel_name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Crop: <strong>{data.parcel_metadata.crop}</strong> • Growth Stage: <strong>{data.parcel_metadata.growth_stage}</strong> • Resolution: {data.parcel_metadata.spatial_resolution}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-moss" style={{ marginBottom: '6px' }}>
              <CheckCircle2 size={13} /> Overpass Calibrated
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Last Satellite Pass: {data.parcel_metadata.last_satellite_overpass}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Spectral Vegetation Indices KPI Grid */}
      <div className="grid-4">
        <MetricCard
          title="NDVI Canopy Biomass"
          value={data.current_indices.ndvi.value}
          unit="/ 1.0"
          delta={data.current_indices.ndvi.rating}
          isPositive={true}
          subtext={`Ref: ${data.current_indices.ndvi.reference_range}`}
          icon={Sprout}
        />
        <MetricCard
          title="NDRE Chlorophyll / Nitrogen"
          value={data.current_indices.ndre.value}
          unit="/ 1.0"
          delta={data.current_indices.ndre.rating}
          isPositive={true}
          subtext={`Ref: ${data.current_indices.ndre.reference_range}`}
          icon={Activity}
        />
        <MetricCard
          title="NDWI Canopy Hydration"
          value={data.current_indices.ndwi.value}
          unit="/ 1.0"
          delta={data.current_indices.ndwi.rating}
          isPositive={true}
          subtext={`Ref: ${data.current_indices.ndwi.reference_range}`}
          icon={Droplets}
        />
        <MetricCard
          title="SAVI Soil Adjusted Index"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
              90-Day Phenological Multi-Spectral Vegetation Curves
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              10-day orbital passes tracking leaf area expansion, chlorophyll buildup, and moisture absorption stages.
            </p>
          </div>
          <span className="badge badge-midnight">10-Day Orbital Cycle</span>
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <Line data={timeSeriesChartData} options={chartOptions} />
        </div>
      </div>

      {/* Zonation & Agronomic Prescription */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Field Zonation Breakdown */}
        <div className="agri-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Layers size={18} color="var(--color-moss-green-light)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
              10-Meter Parcel Zonation & Canopy Vigor
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.canopy_zonation.map((z, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '14px 18px', 
                  background: 'rgba(10, 51, 35, 0.6)', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(131, 153, 88, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--color-beige)', fontSize: '0.92rem' }}>{z.zone}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Coverage: {z.area_pct}% • Vigor: {z.vigor}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-moss-green-light)' }}>
                    NDVI {z.ndvi}
                  </div>
                  <span className={`badge ${z.status.includes('Optimal') ? 'badge-moss' : 'badge-rose'}`} style={{ fontSize: '0.68rem' }}>
                    {z.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Agronomic Brief */}
        <div className="agri-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <FileText size={18} color="var(--color-moss-green-light)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
              Prescriptive Agronomic Advisory
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-moss-green-light)', textTransform: 'uppercase' }}>Biomass Evaluation</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-beige)', marginTop: '2px' }}>{data.actionable_agronomic_brief.biomass_assessment}</div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-moss-green-light)', textTransform: 'uppercase' }}>Nitrogen / Chlorophyll Status</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-beige)', marginTop: '2px' }}>{data.actionable_agronomic_brief.chlorophyll_status}</div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-rosy-brown-light)', textTransform: 'uppercase' }}>Targeted Irrigation Prescription</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-beige)', marginTop: '2px' }}>{data.actionable_agronomic_brief.irrigation_prescription}</div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-moss-green-light)', textTransform: 'uppercase' }}>Disease & Pest Scouting</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-beige)', marginTop: '2px' }}>{data.actionable_agronomic_brief.disease_scouting}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
