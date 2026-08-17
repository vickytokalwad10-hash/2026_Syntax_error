import React, { useState, useEffect } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { cacheData, getCachedData } from '../services/offlineDb';

export default function RentalsPage() {
  const { isOnline } = useNetwork();
  const [activeTab, setActiveTab] = useState('equipment'); // 'equipment' or 'labor'

  // Equipment State
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [eqTitle, setEqTitle] = useState('Mahindra 575 DI (45 HP)');
  const [eqType, setEqType] = useState('Tractor');
  const [eqRate, setEqRate] = useState('2800');
  const [eqLocation, setEqLocation] = useState('Karnal West, Haryana');

  // Labor State
  const [laborList, setLaborList] = useState([]);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [labLeader, setLabLeader] = useState('Jagdish Meena & Team');
  const [labSize, setLabSize] = useState('10');
  const [labSkills, setLabSkills] = useState('Wheat Harvesting, Threshing');
  const [labWage, setLabWage] = useState('450');
  const [labPhone, setLabPhone] = useState('9812300001');

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEquipment();
    fetchLabor();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/rentals/equipment?equipment_type=${selectedType}`);
      if (res.ok) {
        const data = await res.json();
        setEquipmentList(data.equipment || []);
        await cacheData('rentals_equipment', data.equipment);
      }
    } catch (e) {
      const cached = await getCachedData('rentals_equipment');
      if (cached) setEquipmentList(cached);
    }
  };

  const fetchLabor = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/rentals/labor');
      if (res.ok) {
        const data = await res.json();
        setLaborList(data.labor_teams || []);
        await cacheData('rentals_labor', data.labor_teams);
      }
    } catch (e) {
      const cached = await getCachedData('rentals_labor');
      if (cached) setLaborList(cached);
    }
  };

  const handleListEquipment = async (e) => {
    e.preventDefault();
    const payload = {
      title: eqTitle,
      equipment_type: eqType,
      daily_rate_inr: parseInt(eqRate),
      includes_operator: true,
      includes_fuel: false,
      village_district: eqLocation,
      owner_name: 'Ramesh Patil',
      owner_phone: '9800000001'
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/rentals/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setEquipmentList([data.item, ...equipmentList]);
        setShowEquipModal(false);
        setToast('🎉 Machinery rental listing published to the exchange!');
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      setToast('Error listing equipment.');
    }
  };

  const handlePostLabor = async (e) => {
    e.preventDefault();
    const payload = {
      leader_name: labLeader,
      team_size: parseInt(labSize),
      skills: labSkills.split(',').map((s) => s.trim()),
      daily_wage_per_person: parseInt(labWage),
      available_from: '2026-03-01',
      available_to: '2026-04-15',
      village_district: 'Karnal, Haryana',
      contact_phone: labPhone
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/rentals/labor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setLaborList([data.team, ...laborList]);
        setShowLaborModal(false);
        setToast('🎉 Farm labor availability posted!');
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      setToast('Error posting labor.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-brand-600 text-white px-4 py-3 rounded-2xl shadow-floating flex items-center justify-between text-xs font-bold animate-in zoom-in-95">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-brand-600 text-[32px]">agriculture</span>
          Farm Machinery & Labor Sharing
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
          Peer-to-peer tractor, combine harvester, and drone sprayer rentals, plus seasonal labor team hiring boards.
        </p>
      </div>

      {/* Segment Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'equipment' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
            Machinery & Tractors ({equipmentList.length})
          </button>
          <button
            onClick={() => setActiveTab('labor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'labor' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">groups</span>
            Labor Availability ({laborList.length})
          </button>
        </div>

        {activeTab === 'equipment' ? (
          <button
            onClick={() => setShowEquipModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            List Machinery for Rent
          </button>
        ) : (
          <button
            onClick={() => setShowLaborModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Post Labor Team
          </button>
        )}
      </div>

      {/* TAB 1: Equipment Marketplace */}
      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipmentList.map((eq) => (
            <div key={eq.id} className="glass-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-md uppercase">
                      {eq.equipment_type}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">{eq.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">📍 {eq.village_district}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Rate</span>
                    <span className="text-xl font-extrabold text-brand-700">₹{eq.daily_rate_inr.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block">/ day</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Hourly / Acre Rate</span>
                    <span className="font-bold text-slate-800">₹{eq.hourly_rate_inr}/hr</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Operator Included?</span>
                    <span className="font-bold text-emerald-700">{eq.includes_operator ? '✅ Yes' : '❌ No'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Owner Rating</span>
                    <span className="font-bold text-amber-800">⭐ {eq.rating} ({eq.reviews_count})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Availability</span>
                    <span className="font-bold text-emerald-700">{eq.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Owner: {eq.owner_name}</span>
                <a
                  href={`tel:${eq.owner_phone}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Call ({eq.owner_phone})
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Labor Board */}
      {activeTab === 'labor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {laborList.map((lab) => (
            <div key={lab.id} className="glass-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900">{lab.leader_name}</h4>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {lab.team_size} Workers Team
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">📍 {lab.village_district}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Wage</span>
                    <span className="text-xl font-extrabold text-brand-700">₹{lab.daily_wage_per_person}</span>
                    <span className="text-[10px] text-slate-400 block">/ worker / day</span>
                  </div>
                </div>

                <div className="my-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialized Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.skills.map((skill, idx) => (
                      <span key={idx} className="text-xs font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                        🌾 {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  📅 <strong>Available Window:</strong> {lab.available_from} to {lab.available_to}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-emerald-700">✅ Verified Contact</span>
                <a
                  href={`tel:${lab.contact_phone}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Hire Team ({lab.contact_phone})
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-slate-200 animate-in zoom-in-95">
            <h4 className="text-base font-extrabold text-slate-900 mb-3">List Farm Machinery for Rent</h4>
            <form onSubmit={handleListEquipment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Machinery Title & Make</label>
                <input
                  type="text"
                  value={eqTitle}
                  onChange={(e) => setEqTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Equipment Type</label>
                  <select
                    value={eqType}
                    onChange={(e) => setEqType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Tractor">Tractor</option>
                    <option value="Combine Harvester">Combine Harvester</option>
                    <option value="Drone Sprayer">Drone Sprayer</option>
                    <option value="Laser Leveler">Laser Leveler</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Rent (₹/day)</label>
                  <input
                    type="number"
                    value={eqRate}
                    onChange={(e) => setEqRate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Village / District</label>
                <input
                  type="text"
                  value={eqLocation}
                  onChange={(e) => setEqLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEquipModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs active:scale-95"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Labor Modal */}
      {showLaborModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-slate-200 animate-in zoom-in-95">
            <h4 className="text-base font-extrabold text-slate-900 mb-3">Post Farm Labor Availability</h4>
            <form onSubmit={handlePostLabor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Team Leader Name / Toli Name</label>
                <input
                  type="text"
                  value={labLeader}
                  onChange={(e) => setLabLeader(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Workers Count</label>
                  <input
                    type="number"
                    value={labSize}
                    onChange={(e) => setLabSize(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Wage (₹/worker)</label>
                  <input
                    type="number"
                    value={labWage}
                    onChange={(e) => setLabWage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={labSkills}
                  onChange={(e) => setLabSkills(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={labPhone}
                  onChange={(e) => setLabPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLaborModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs active:scale-95"
                >
                  Post Labor Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
