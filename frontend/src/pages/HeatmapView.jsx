import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
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

// Center of India
const INDIA_CENTER = [22.9734, 78.6569];

function getNdviColor(ndvi) {
  if (ndvi >= 0.75) return '#839958'; // Lush Moss Green
  if (ndvi >= 0.65) return '#A3BA76'; // Light Green
  if (ndvi >= 0.55) return '#E8C172'; // Yellow/Gold
  return '#D3968C'; // Rosy Brown / Stressed
}

export default function HeatmapView() {
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
        // Fallback default state data
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Satellite size={18} color="var(--color-moss-green-light)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>
              India Remote Sensing & Satellite Canopy Heatmap
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            High-resolution Copernicus Sentinel-2 MSI Multi-Spectral Vegetation Indices (NDVI, EVI, Soil Moisture %) calibrated across all state agro-climatic zones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={mapLayer === 'satellite' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMapLayer('satellite')}
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            <Satellite size={15} />
            <span>Satellite View</span>
          </button>
          <button 
            className={mapLayer === 'street' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMapLayer('street')}
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            <Layers size={15} />
            <span>Topographic</span>
          </button>
        </div>
      </div>

      {/* Main Map + Side Analytics Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', minHeight: '560px' }}>
        {/* Leaflet Map Card */}
        <div className="agri-card" style={{ padding: '8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, borderRadius: 'var(--radius-sm)', overflow: 'hidden', minHeight: '520px' }}>
            <MapContainer
              center={INDIA_CENTER}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              {mapLayer === 'satellite' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                    radius={isSelected ? 22 : 16}
                    pathOptions={{
                      color: isSelected ? '#F7F4D5' : color,
                      fillColor: color,
                      fillOpacity: 0.75,
                      weight: isSelected ? 3 : 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedState(st)
                    }}
                  >
                    <Popup>
                      <div style={{ padding: '6px', minWidth: '180px' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: '#F7F4D5', fontSize: '1rem' }}>
                          {st.state_name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px 4px 14px', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>NDVI Vegetation Density Scale:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#839958', display: 'inline-block' }} />
                <span>Lush Dense (&ge;0.75)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#A3BA76', display: 'inline-block' }} />
                <span>Optimal (0.65-0.74)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E8C172', display: 'inline-block' }} />
                <span>Moderate (0.55-0.64)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D3968C', display: 'inline-block' }} />
                <span>Stress / Arid (&lt;0.55)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected State Analytics Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedState ? (
            <>
              <div className="agri-card-solid" style={{ borderLeft: `5px solid ${getNdviColor(selectedState.ndvi_index)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Selected State Zone
                    </span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-beige)' }}>
                      {selectedState.state_name}
                    </h3>
                  </div>
                  <span className={`badge ${selectedState.ndvi_index >= 0.7 ? 'badge-moss' : (selectedState.ndvi_index >= 0.6 ? 'badge-midnight' : 'badge-rose')}`}>
                    {selectedState.health_status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NDVI CANOPY</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-beige)' }}>{selectedState.ndvi_index}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-moss-green-light)' }}>Dense Vegetative Cover</div>
                  </div>

                  <div style={{ padding: '10px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SOIL MOISTURE</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-beige)' }}>{selectedState.soil_moisture_pct}%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>0-20cm Volumetric</div>
                  </div>

                  <div style={{ padding: '10px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DROUGHT RISK</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: selectedState.drought_risk_score > 3.0 ? 'var(--color-rosy-brown-light)' : 'var(--color-moss-green-light)' }}>
                      {selectedState.drought_risk_score} / 5.0
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normalized Hazard</div>
                  </div>

                  <div style={{ padding: '10px', background: 'rgba(5, 28, 19, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(131, 153, 88, 0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>YIELD PROJECTION</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: selectedState.yield_projection_delta_pct >= 0 ? 'var(--color-moss-green-light)' : 'var(--color-rosy-brown-light)' }}>
                      {selectedState.yield_projection_delta_pct >= 0 ? `+${selectedState.yield_projection_delta_pct}%` : `${selectedState.yield_projection_delta_pct}%`}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>vs 5-Yr Baseline</div>
                  </div>
                </div>

                {/* Primary Crops in State */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Dominant Crops Under Cultivation:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedState.primary_crops.map((c, i) => (
                      <span key={i} className="badge badge-dark" style={{ fontSize: '0.75rem' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* State Selection Quick List */}
              <div className="agri-card" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Switch State Territory
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {states.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedState(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: selectedState.id === s.id ? 'rgba(131, 153, 88, 0.3)' : 'rgba(5, 28, 19, 0.6)',
                        border: selectedState.id === s.id ? '1px solid var(--color-moss-green-light)' : '1px solid rgba(131, 153, 88, 0.1)',
                        color: 'var(--color-beige)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: selectedState.id === s.id ? '700' : '500' }}>
                        {s.state_name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: getNdviColor(s.ndvi_index), fontWeight: '700' }}>
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
