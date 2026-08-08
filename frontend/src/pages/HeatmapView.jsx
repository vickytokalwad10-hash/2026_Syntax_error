import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Satellite, 
  Layers, 
  Droplets, 
  SunMedium, 
  Activity, 
  Sparkles, 
  MapPin, 
  Info 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// Center of India
const INDIA_CENTER = [22.9734, 78.6569];

function getNdviColor(ndvi) {
  if (ndvi >= 0.75) return '#FACC15'; // Crisp Yellow
  if (ndvi >= 0.65) return '#EAB308'; // Amber
  if (ndvi >= 0.55) return '#94A3B8'; // Slate
  return '#EF4444'; // Red / Stressed
}

export default function HeatmapView() {
  const { t, language } = useLanguage();
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [mapLayer, setMapLayer] = useState('satellite'); // 'satellite' or 'street'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.getHeatmap();
      if (res && res.states) {
        setStates(res.states);
        setSelectedState(res.states[0]);
      } else {
        const defaultStates = [
          { id: "punjab", state_name: "Punjab", lat: 31.1471, lng: 75.3412, ndvi_index: 0.78, evi_index: 0.62, soil_moisture_pct: 34.5, drought_risk_score: 1.2, health_status: "Excellent", primary_crops: ["Wheat", "Paddy", "Cotton", "Maize"], yield_projection_delta_pct: 6.5 },
          { id: "haryana", state_name: "Haryana", lat: 29.0588, lng: 76.0856, ndvi_index: 0.74, evi_index: 0.59, soil_moisture_pct: 31.2, drought_risk_score: 1.8, health_status: "Optimal", primary_crops: ["Wheat", "Mustard", "Sugarcane", "Paddy"], yield_projection_delta_pct: 4.8 },
          { id: "madhya_pradesh", state_name: "Madhya Pradesh", lat: 22.9734, lng: 78.6569, ndvi_index: 0.69, evi_index: 0.54, soil_moisture_pct: 28.6, drought_risk_score: 2.5, health_status: "Good", primary_crops: ["Soybean", "Wheat", "Gram", "Mustard"], yield_projection_delta_pct: 2.2 },
          { id: "maharashtra", state_name: "Maharashtra", lat: 19.7515, lng: 75.7139, ndvi_index: 0.61, evi_index: 0.48, soil_moisture_pct: 22.4, drought_risk_score: 3.8, health_status: "Moderate Stress", primary_crops: ["Cotton", "Soybean", "Sugarcane", "Onion"], yield_projection_delta_pct: -3.5 },
          { id: "gujarat", state_name: "Gujarat", lat: 22.2587, lng: 71.1924, ndvi_index: 0.64, evi_index: 0.50, soil_moisture_pct: 24.1, drought_risk_score: 3.1, health_status: "Stable", primary_crops: ["Cotton", "Groundnut", "Cumin", "Castor"], yield_projection_delta_pct: 1.0 },
          { id: "uttar_pradesh", state_name: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, ndvi_index: 0.72, evi_index: 0.58, soil_moisture_pct: 32.0, drought_risk_score: 2.0, health_status: "Optimal", primary_crops: ["Wheat", "Sugarcane", "Paddy", "Potato"], yield_projection_delta_pct: 3.8 },
          { id: "rajasthan", state_name: "Rajasthan", lat: 27.0238, lng: 74.2179, ndvi_index: 0.52, evi_index: 0.39, soil_moisture_pct: 16.8, drought_risk_score: 4.6, health_status: "High Aridity Alert", primary_crops: ["Mustard", "Bajra", "Guar", "Wheat"], yield_projection_delta_pct: -7.2 },
          { id: "andhra_pradesh", state_name: "Andhra Pradesh", lat: 15.9129, lng: 79.7400, ndvi_index: 0.68, evi_index: 0.53, soil_moisture_pct: 29.8, drought_risk_score: 2.4, health_status: "Good", primary_crops: ["Paddy", "Chilli", "Cotton", "Tobacco"], yield_projection_delta_pct: 2.8 },
          { id: "karnataka", state_name: "Karnataka", lat: 15.3173, lng: 75.7139, ndvi_index: 0.65, evi_index: 0.51, soil_moisture_pct: 26.5, drought_risk_score: 2.9, health_status: "Stable", primary_crops: ["Maize", "Paddy", "Sugarcane", "Ragi"], yield_projection_delta_pct: 0.5 },
          { id: "west_bengal", state_name: "West Bengal", lat: 22.9868, lng: 87.8550, ndvi_index: 0.76, evi_index: 0.61, soil_moisture_pct: 36.2, drought_risk_score: 1.1, health_status: "Exceptional", primary_crops: ["Paddy", "Jute", "Potato", "Tea"], yield_projection_delta_pct: 5.5 }
        ];
        setStates(defaultStates);
        setSelectedState(defaultStates[0]);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Satellite size={18} color="#FACC15" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>
              {t('heatmapTitle')}
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            High-resolution Copernicus Sentinel-2 MSI Multi-Spectral Vegetation Indices (NDVI, EVI, Soil Moisture %) calibrated across all state agro-climatic zones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={mapLayer === 'satellite' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMapLayer('satellite')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Satellite size={14} />
            <span>Satellite</span>
          </button>
          <button 
            className={mapLayer === 'street' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMapLayer('street')}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Layers size={14} />
            <span>Topographic</span>
          </button>
        </div>
      </div>

      {/* Main Map + Side Analytics Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', minHeight: '520px' }}>
        {/* Leaflet Map Card */}
        <div className="agri-card" style={{ padding: '6px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', minHeight: '480px' }}>
            <MapContainer
              center={INDIA_CENTER}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              {mapLayer === 'satellite' ? (
                <TileLayer
                  attribution='&copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              ) : (
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}

              {states.map((st) => {
                const color = getNdviColor(st.ndvi_index);
                const isSelected = selectedState && selectedState.id === st.id;
                return (
                  <CircleMarker
                    key={st.id}
                    center={[st.lat, st.lng]}
                    radius={isSelected ? 20 : 14}
                    pathOptions={{
                      color: isSelected ? '#FFFFFF' : color,
                      fillColor: color,
                      fillOpacity: 0.8,
                      weight: isSelected ? 3 : 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedState(st)
                    }}
                  >
                    <Popup>
                      <div style={{ padding: '4px', minWidth: '160px', color: '#111827' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>
                          {st.state_name}
                        </h4>
                        <div style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                          <div><strong>NDVI Index:</strong> {st.ndvi_index}</div>
                          <div><strong>Soil Moisture:</strong> {st.soil_moisture_pct}%</div>
                          <div><strong>Status:</strong> {st.health_status}</div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Map Color Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px 2px 12px', fontSize: '0.72rem' }}>
            <span style={{ color: '#94A3B8' }}>NDVI Scale:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FACC15', display: 'inline-block' }} />
                <span>Lush (&ge;0.75)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EAB308', display: 'inline-block' }} />
                <span>Optimal (0.65-0.74)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94A3B8', display: 'inline-block' }} />
                <span>Moderate (0.55-0.64)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                <span>Stress (&lt;0.55)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected State Analytics Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {selectedState ? (
            <>
              <div className="agri-card" style={{ borderLeft: `4px solid ${getNdviColor(selectedState.ndvi_index)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Selected Zone
                    </span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF' }}>
                      {selectedState.state_name}
                    </h3>
                  </div>
                  <span className={`badge ${selectedState.ndvi_index >= 0.7 ? 'badge-yellow' : (selectedState.ndvi_index >= 0.6 ? 'badge-white' : 'badge-rose')}`}>
                    {selectedState.health_status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                  <div style={{ padding: '8px 10px', background: '#1E293B', borderRadius: '4px', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{t('ndviCanopy')}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>{selectedState.ndvi_index}</div>
                    <div style={{ fontSize: '0.68rem', color: '#FACC15' }}>Canopy Cover</div>
                  </div>

                  <div style={{ padding: '8px 10px', background: '#1E293B', borderRadius: '4px', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{t('soilMoisturePct')}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>{selectedState.soil_moisture_pct}%</div>
                    <div style={{ fontSize: '0.68rem', color: '#CBD5E1' }}>Volumetric</div>
                  </div>

                  <div style={{ padding: '8px 10px', background: '#1E293B', borderRadius: '4px', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{t('droughtRisk')}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: selectedState.drought_risk_score > 3.0 ? '#FCA5A5' : '#FACC15' }}>
                      {selectedState.drought_risk_score} / 5.0
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Risk Score</div>
                  </div>

                  <div style={{ padding: '8px 10px', background: '#1E293B', borderRadius: '4px', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{t('yieldProjection')}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: selectedState.yield_projection_delta_pct >= 0 ? '#FACC15' : '#FCA5A5' }}>
                      {selectedState.yield_projection_delta_pct >= 0 ? `+${selectedState.yield_projection_delta_pct}%` : `${selectedState.yield_projection_delta_pct}%`}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>vs 5-Yr Mean</div>
                  </div>
                </div>

                {/* Primary Crops in State */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '600', color: '#CBD5E1', marginBottom: '6px' }}>
                    Dominant Crops:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {selectedState.primary_crops.map((c, i) => (
                      <span key={i} className="badge badge-white" style={{ fontSize: '0.7rem' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* State Selection Quick List */}
              <div className="agri-card" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Switch State Territory
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                  {states.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedState(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: selectedState.id === s.id ? '#1E293B' : 'transparent',
                        border: selectedState.id === s.id ? '1px solid #FACC15' : '1px solid #374151',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: selectedState.id === s.id ? '700' : 'normal' }}>
                        {s.state_name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: getNdviColor(s.ndvi_index), fontWeight: '700' }}>
                        NDVI {s.ndvi_index}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
