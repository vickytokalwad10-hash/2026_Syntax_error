import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';

export default function ArbitragePage() {
  const { t, formatCurrency } = useLanguage();
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
          background-color: ${isBase ? '#14532d' : isProfitable ? '#16a34a' : '#78716c'};
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border: 1.5px solid white;
          text-align: center;
        ">
          ${isBase ? '📍 Base: ' : ''}₹${price}
        </div>
      `,
      iconSize: [84, 28],
      iconAnchor: [42, 14]
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e7e5e4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
              {t('arbitrage.title')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5">
            {t('arbitrage.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl mt-0.5">
            {t('arbitrage.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-[#78716c]">Freight Cost Rate:</span>
          <span className="text-xs font-extrabold text-[#14532d] bg-[#f5fdf7] border border-[#bbf7d0] px-3 py-1 rounded-xl shadow-2xs">
            ₹{freightRatePerKm} / km / Ton
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-6 paper-card p-4 sm:p-5">
          <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-[#f5f2eb]">
            <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial">Regional APMC Price Spread Map</h3>
            <span className="text-[11px] font-bold text-[#78716c]">Base: Karnal West</span>
          </div>

          <div className="w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-[#e7e5e4]">
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
                      <p className="font-extrabold text-[#14532d]">{m.name}</p>
                      <p>Spot Price: ₹{m.spotPrice}/qtl</p>
                      <p>Distance: {m.distanceKm} km</p>
                      <p className={`font-bold ${m.isProfitable ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {m.isBase ? 'Base Origin' : `Net Gain: ₹${m.totalNetGain.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Column: Net Realization Matrix Table */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="paper-card p-4 sm:p-5">
            <h3 className="text-sm font-extrabold text-[#1c1917] font-editorial mb-3 pb-2 border-b border-[#f5f2eb]">
              Net Realization Matrix (25 Ton Truckload)
            </h3>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs min-w-[400px]">
                <thead>
                  <tr className="border-b border-[#e7e5e4] text-[#78716c] uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="pb-2">Destination Mandi</th>
                    <th className="pb-2">Spot</th>
                    <th className="pb-2">Freight</th>
                    <th className="pb-2 text-right">Net Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f2eb]">
                  {calculatedMandis.map((m, idx) => (
                    <tr key={idx} className="hover:bg-[#faf8f5] transition">
                      <td className="py-2.5 font-bold text-[#1c1917]">
                        {m.name}
                        {m.isBase && (
                          <span className="ml-1.5 px-1.5 py-0.2 bg-[#f5f2eb] text-[9px] font-bold text-[#78716c] rounded">
                            Origin
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 font-extrabold text-[#1c1917]">₹{m.spotPrice}</td>
                      <td className="py-2.5 text-[#78716c]">{m.distanceKm}km (-₹{m.freightCostPerQtl})</td>
                      <td className="py-2.5 text-right">
                        {m.isBase ? (
                          <span className="text-[#a8a29e] font-semibold">—</span>
                        ) : m.isProfitable ? (
                          <span className="font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg">
                            +₹{m.totalNetGain.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="font-semibold text-[#78716c] bg-[#f5f2eb] px-2 py-0.5 rounded-lg">
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
          <div className="paper-card p-4 border-l-4 border-l-[#14532d] bg-[#f5fdf7] text-xs">
            <h4 className="font-extrabold text-[#14532d] mb-1 flex items-center gap-1.5 font-editorial text-sm">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Optimal Route: Khanna Mandi (+₹26,250 Net Gain)
            </h4>
            <p className="text-[#15803d] leading-relaxed text-[11px] font-medium">
              Transporting 25 Tons to Khanna Mandi yields a net realization of +₹105/qtl after deducting ₹65/qtl in freight logistics, resulting in a total net gain of +₹26,250 over local Karnal sale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
