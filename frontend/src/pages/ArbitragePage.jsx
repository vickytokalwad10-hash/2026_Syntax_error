import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function ArbitragePage() {
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [freightRatePerKm, setFreightRatePerKm] = useState(4.5); // ₹ / km / ton
  const [cargoWeightTons, setCargoWeightTons] = useState(25); // 250 Quintals

  const mandis = [
    { name: 'Karnal Mandi (Base)', state: 'Haryana', distanceKm: 0, spotPrice: 2840, lat: 29.6857, lng: 76.9905, isBase: true },
    { name: 'Khanna Mandi (Asia Largest)', state: 'Punjab', distanceKm: 145, spotPrice: 2985, lat: 30.7071, lng: 76.2167, isBase: false },
    { name: 'Delhi Narela Mandi', state: 'Delhi NCR', distanceKm: 110, spotPrice: 2920, lat: 28.8525, lng: 77.0935, isBase: false },
    { name: 'Rohtak Mandi', state: 'Haryana', distanceKm: 95, spotPrice: 2880, lat: 28.8955, lng: 76.6066, isBase: false },
    { name: 'Jaipur Surajpole Mandi', state: 'Rajasthan', distanceKm: 340, spotPrice: 3050, lat: 26.9124, lng: 75.7873, isBase: false }
  ];

  // Arbitrage Spread Calculation
  const basePrice = mandis.find((m) => m.isBase)?.spotPrice || 2840;

  const calculatedMandis = mandis.map((m) => {
    const grossSpreadPerQtl = m.spotPrice - basePrice;
    // Freight cost per quintal = (distance * rate_per_ton_km) / 10 quintals
    const freightCostPerQtl = m.distanceKm === 0 ? 0 : Math.round((m.distanceKm * freightRatePerKm) / 10);
    const mandiCessPerQtl = m.distanceKm === 0 ? 0 : Math.round(m.spotPrice * 0.015);
    const netRealizationPerQtl = grossSpreadPerQtl - freightCostPerQtl - mandiCessPerQtl;
    const totalNetGain = Math.round(netRealizationPerQtl * (cargoWeightTons * 10));

    return {
      ...m,
      grossSpreadPerQtl,
      freightCostPerQtl,
      mandiCessPerQtl,
      netRealizationPerQtl,
      totalNetGain,
      isProfitable: totalNetGain > 0
    };
  });

  // Custom Leaflet Div Icon
  const createModernPin = (price, isBase, isProfitable) => {
    return L.divIcon({
      className: 'custom-modern-pin',
      html: `
        <div style="
          background-color: ${isBase ? '#166534' : isProfitable ? '#16a34a' : '#64748b'};
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          border: 1px solid white;
          text-align: center;
        ">
          ${isBase ? '📍 Base: ' : ''}₹${price}
        </div>
      `,
      iconSize: [80, 26],
      iconAnchor: [40, 13]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Inter-Mandi Price Arbitrage Optimizer
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            500km radius APMC price comparison factoring realtime diesel freight rates & mandi cess.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Freight Cost Rate:</span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md">
            ₹{freightRatePerKm} / km / Ton
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Regional APMC Price Spread Map</h3>
            <span className="text-xs text-slate-500">Base: Karnal West</span>
          </div>

          <div className="w-full h-[380px] rounded-xl overflow-hidden border border-slate-200">
            <MapContainer
              center={[29.6857, 76.9905]}
              zoom={7}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {calculatedMandis.map((m, idx) => (
                <Marker
                  key={idx}
                  position={[m.lat, m.lng]}
                  icon={createModernPin(m.spotPrice, m.isBase, m.isProfitable)}
                >
                  <Popup>
                    <div className="font-sans text-xs">
                      <p className="font-bold text-emerald-800">{m.name}</p>
                      <p>Spot Price: ₹{m.spotPrice}/qtl</p>
                      <p>Distance: {m.distanceKm} km</p>
                      <p className={`font-bold ${m.isProfitable ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {m.isBase ? 'Base Reference' : `Net Gain: ₹${m.totalNetGain.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Column: Net Realization Matrix Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Net Freight Realization Matrix (25 Ton Truckload)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="pb-2">Destination Mandi</th>
                    <th className="pb-2">Spot</th>
                    <th className="pb-2">Freight</th>
                    <th className="pb-2 text-right">Net Profit Spread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calculatedMandis.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-semibold text-slate-900">
                        {m.name}
                        {m.isBase && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 rounded">
                            Origin
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-bold text-slate-800">₹{m.spotPrice}</td>
                      <td className="py-3 text-slate-500">{m.distanceKm}km (-₹{m.freightCostPerQtl})</td>
                      <td className="py-3 text-right">
                        {m.isBase ? (
                          <span className="text-slate-500 font-semibold">—</span>
                        ) : m.isProfitable ? (
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">
                            +₹{m.totalNetGain.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            -₹{Math.abs(m.totalNetGain).toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Arbitrage Insight */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs">
            <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-emerald-700">stars</span>
              Optimal Route Recommendation: Khanna Mandi (+₹26,250 Net)
            </h4>
            <p className="text-emerald-800 leading-relaxed">
              Transporting 25 Tons to Khanna Mandi yields a net realization of +₹105/qtl after deducting ₹65/qtl in freight logistics, resulting in a total net gain of +₹26,250 over local Karnal sale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
