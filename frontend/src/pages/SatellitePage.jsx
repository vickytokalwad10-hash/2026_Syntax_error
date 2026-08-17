import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';

export default function SatellitePage() {
  const { user } = useAuth();
  const [selectedParcel, setSelectedParcel] = useState('North Field 4');
  const [selectedLayer, setSelectedLayer] = useState('NDVI');
  const [treatmentScheduled, setTreatmentScheduled] = useState(false);

  // Field Coordinates (Karnal / Nashik coordinates)
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Satellite Crop Health & Multispectral NDVI
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sentinel-2 10m high-resolution spectral vegetation telemetry and canopy stress mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedParcel}
            onChange={(e) => setSelectedParcel(e.target.value)}
            className="p-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-emerald-600 shadow-xs"
          >
            {Object.keys(parcels).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left / Main: Map Canvas (from Stitch Export) */}
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-xl shadow-xs p-6 flex flex-col">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{current.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-600">schedule</span>
                Acquired: {current.acquired}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              {['NDVI', 'NDRE', 'EVI', 'MSAVI'].map((layer) => (
                <button
                  key={layer}
                  onClick={() => setSelectedLayer(layer)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    selectedLayer === layer
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-200">
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
                  color: '#16a34a',
                  fillColor: '#22c55e',
                  fillOpacity: 0.55,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <p className="font-bold text-emerald-800">{current.name}</p>
                    <p>Crop: {current.crop}</p>
                    <p>NDVI Index: {current.ndviScore}</p>
                    <p>Size: {current.size}</p>
                  </div>
                </Popup>
              </Polygon>

              {/* Simulated Stress Hotspot Pin */}
              <CircleMarker
                center={[29.6845, 76.9920]}
                radius={16}
                pathOptions={{
                  color: '#dc2626',
                  fillColor: '#ef4444',
                  fillOpacity: 0.6,
                  dashArray: '4, 4'
                }}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <p className="font-bold text-red-600">⚠️ Nitrogen Stress Hotspot</p>
                    <p>Chlorophyll deficit detected in SE 0.8 Acres.</p>
                  </div>
                </Popup>
              </CircleMarker>
            </MapContainer>

            {/* In-Map Floating Badges */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-xs font-bold text-emerald-800">Healthy Canopy Zone (87%)</span>
            </div>

            <div className="absolute bottom-4 right-4 z-[1000] bg-red-50/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-red-200 shadow-md text-red-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-red-600">warning</span>
              <span className="text-xs font-bold">Nitrogen Stress (13%)</span>
            </div>
          </div>

          {/* Color Gradient Legend */}
          <div className="mt-5 flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
            <span>Low (0.0)</span>
            <div className="h-2.5 w-64 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-600 rounded-full shadow-inner"></div>
            <span>High (1.0)</span>
          </div>
        </div>

        {/* Right Column: Sticky Telemetry Notes (from Stitch Export) */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4">
          {/* Canopy Score Note */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                <span className="material-symbols-outlined text-emerald-700 bg-emerald-100 p-1 rounded-md text-[18px]">
                  eco
                </span>
                Canopy Score
              </h4>
              <span className="text-2xl font-bold text-emerald-800">
                {current.canopyScore}<span className="text-slate-600 text-sm font-normal">/100</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Overall biomass coverage looks strong. Slight dip in the SE quadrant compared to last week.
            </p>
          </div>

          {/* Moisture % Note */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-1 rounded-md text-[18px]">
                  water_drop
                </span>
                Soil Moisture
              </h4>
              <span className="text-2xl font-bold text-blue-600">{current.moisture}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Holding steady at root depth. No immediate irrigation needed for the next 48 hours.
            </p>
          </div>

          {/* Nitrogen Alert Note */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl shadow-xs p-5">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
                Nitrogen Alert
              </h4>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              Low N detected in SE quadrant stress zone. Recommend targeted top-dress urea (18 kg/acre) before upcoming showers.
            </p>
            <button
              onClick={() => setTreatmentScheduled(true)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition shadow-xs"
            >
              {treatmentScheduled ? '✓ Treatment Scheduled' : 'Schedule Urea Treatment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
