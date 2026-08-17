import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function SatellitePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedParcel, setSelectedParcel] = useState('North Field 4');
  const [selectedLayer, setSelectedLayer] = useState('NDVI');
  const [treatmentScheduled, setTreatmentScheduled] = useState(false);

  // Field Coordinates (Karnal coordinates)
  const centerPosition = [29.6857, 76.9905];

  const parcels = {
    'North Field 4': {
      name: 'North Field 4 - Sharbati Wheat',
      crop: 'Wheat (Rabi 2026)',
      size: '6.4 Acres',
      acquired: 'Today, 10:30 AM (Sentinel-2 10m)',
      ndviScore: '0.82',
      canopyScore: '82',
      moisture: '45%',
      stressZone: 'SE Quadrant (0.8 Acres Low Nitrogen)',
      polygon: [
        [29.6875, 76.9880],
        [29.6890, 76.9925],
        [29.6845, 76.9940],
        [29.6830, 76.9895]
      ]
    },
    'South Parcel B': {
      name: 'South Parcel B - Mustard',
      crop: 'Mustard (Brassica)',
      size: '4.2 Acres',
      acquired: 'Yesterday, 11:15 AM',
      ndviScore: '0.74',
      canopyScore: '74',
      moisture: '38%',
      stressZone: 'Optimal Uniform Growth',
      polygon: [
        [29.6815, 76.9885],
        [29.6830, 76.9930],
        [29.6795, 76.9940],
        [29.6780, 76.9895]
      ]
    }
  };

  const current = parcels[selectedParcel] || parcels['North Field 4'];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
              Sentinel-2 MSI 10m Resolution
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            {t('satellite.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl mt-0.5">
            {t('satellite.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedParcel}
            onChange={(e) => setSelectedParcel(e.target.value)}
            className="p-2 text-xs font-bold bg-white border border-[#e7e5e4] rounded-xl text-[#1c1917] focus:outline-[#14532d] shadow-2xs"
          >
            {Object.keys(parcels).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 items-start">
        {/* Left / Main: Map Canvas */}
        <div className="flex-1 w-full paper-card p-4 sm:p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#f5f2eb] pb-3 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1c1917] font-editorial">{current.name}</h3>
              <p className="text-[11px] text-[#78716c] mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#78716c]">schedule</span>
                Acquired: {current.acquired}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#f5f2eb] p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
              {['NDVI', 'NDRE', 'EVI', 'MSAVI'].map((layer) => (
                <button
                  key={layer}
                  onClick={() => setSelectedLayer(layer)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedLayer === layer
                      ? 'bg-white text-[#14532d] shadow-2xs'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map Container with Explicit Responsive Height */}
          <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden border border-[#e7e5e4]">
            <MapContainer
              center={centerPosition}
              zoom={15}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Parcel Polygon with NDVI Emerald Gradient */}
              <Polygon
                positions={current.polygon}
                pathOptions={{
                  color: '#14532d',
                  fillColor: '#16a34a',
                  fillOpacity: 0.55,
                  weight: 2.5
                }}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <p className="font-extrabold text-[#14532d]">{current.name}</p>
                    <p>Crop: {current.crop}</p>
                    <p>NDVI Score: {current.ndviScore}</p>
                    <p>Size: {current.size}</p>
                  </div>
                </Popup>
              </Polygon>

              {/* Simulated Stress Hotspot Pin */}
              <CircleMarker
                center={[29.6845, 76.9920]}
                radius={16}
                pathOptions={{
                  color: '#ea580c',
                  fillColor: '#ea580c',
                  fillOpacity: 0.6,
                  dashArray: '4, 4'
                }}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <p className="font-bold text-[#ea580c]">⚠️ Nitrogen Stress Hotspot</p>
                    <p>Chlorophyll deficit detected in SE 0.8 Acres.</p>
                  </div>
                </Popup>
              </CircleMarker>
            </MapContainer>

            {/* In-Map Floating Badges */}
            <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#e7e5e4] shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-[#14532d]">
              <span className="w-2 h-2 rounded-full bg-[#14532d]"></span>
              <span>Healthy Canopy (87%)</span>
            </div>

            <div className="absolute bottom-3 right-3 z-[1000] bg-[#fffbeb]/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#fef3c7] shadow-xs text-[#92400e] flex items-center gap-1 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[15px] text-[#ea580c]">warning</span>
              <span>Low Nitrogen (13%)</span>
            </div>
          </div>

          {/* Color Gradient Legend */}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs font-semibold text-[#78716c]">
            <span className="text-[11px]">Low (0.0)</span>
            <div className="h-2.5 w-48 sm:w-64 bg-gradient-to-r from-red-500 via-yellow-400 to-[#14532d] rounded-full shadow-inner"></div>
            <span className="text-[11px]">High (1.0)</span>
          </div>
        </div>

        {/* Right Column: Sticky Telemetry Notes */}
        <div className="w-full lg:w-[320px] flex flex-col gap-3 sm:gap-4">
          {/* Canopy Score Note */}
          <div className="paper-card p-4 sm:p-5">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-extrabold flex items-center gap-1.5 text-[#1c1917]">
                <span className="material-symbols-outlined text-[#14532d] bg-emerald-50 p-1 rounded-lg text-[18px]">
                  eco
                </span>
                Canopy Health Index
              </h4>
              <span className="text-xl font-black text-[#14532d]">
                {current.canopyScore}<span className="text-[#78716c] text-xs font-normal">/100</span>
              </span>
            </div>
            <p className="text-xs text-[#57534e] leading-relaxed">
              Overall biomass coverage looks strong. Slight dip in the SE quadrant compared to last week.
            </p>
          </div>

          {/* Moisture % Note */}
          <div className="paper-card p-4 sm:p-5">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-extrabold flex items-center gap-1.5 text-[#1c1917]">
                <span className="material-symbols-outlined text-blue-700 bg-blue-50 p-1 rounded-lg text-[18px]">
                  water_drop
                </span>
                Root Zone Soil Moisture
              </h4>
              <span className="text-xl font-black text-blue-700">{current.moisture}</span>
            </div>
            <p className="text-xs text-[#57534e] leading-relaxed">
              Holding steady at root depth. No immediate irrigation needed for the next 48 hours.
            </p>
          </div>

          {/* Nitrogen Alert Note */}
          <div className="paper-card p-4 sm:p-5 border-l-4 border-l-[#ea580c] bg-[#fffbeb]">
            <div className="flex justify-between items-start mb-1.5">
              <h4 className="text-xs font-extrabold text-[#92400e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ea580c] text-[18px]">error</span>
                Nitrogen Deficit Alert
              </h4>
            </div>
            <p className="text-xs text-[#78350f] leading-relaxed">
              Low N detected in SE quadrant stress zone. Recommend targeted top-dress urea (18 kg/acre) before upcoming showers.
            </p>
            <button
              onClick={() => setTreatmentScheduled(true)}
              className="mt-3 w-full bg-[#14532d] hover:bg-[#052e16] text-white text-xs font-extrabold py-2.5 px-4 rounded-xl transition shadow-xs btn-tap"
            >
              {treatmentScheduled ? '✓ Advisory Scheduled' : 'Schedule Urea Treatment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
