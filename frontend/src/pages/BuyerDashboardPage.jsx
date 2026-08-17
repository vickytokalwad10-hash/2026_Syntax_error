import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [selectedLotForEscrow, setSelectedLotForEscrow] = useState(null);
  const [lockedLots, setLockedLots] = useState([]);
  const [toast, setToast] = useState(null);

  const verifiedFPOLots = [
    {
      id: 'LOT-FPO-101',
      fpo: 'Karnal Farmers Producer Co-op',
      commodity: 'Sharbati Wheat (Grade A)',
      location: 'Karnal, Haryana (WDRA Godown #2)',
      quantity: '1,200 Quintals (120 Tons)',
      price: '₹2,840',
      totalValue: '₹34,08,000',
      assayReport: 'NABL Certified • Moisture 11.2% • Protein 13.4%',
      wdraStatus: 'WDRA Certified E-Receipt Available',
      badge: 'VERIFIED FPO'
    },
    {
      id: 'LOT-FPO-102',
      fpo: 'Malwa Organic Farmers Federation',
      commodity: 'Yellow Soybean (Non-GMO)',
      location: 'Indore, MP (State Warehousing Corp)',
      quantity: '800 Quintals (80 Tons)',
      price: '₹4,890',
      totalValue: '₹39,12,000',
      assayReport: 'APEDA Export Grade • Oil 19.8% • Moisture 10.1%',
      wdraStatus: 'WDRA Stored & Insured',
      badge: 'APEDA ORGANIC'
    },
    {
      id: 'LOT-FPO-103',
      fpo: 'Tarawadi Basmati Alliance',
      commodity: 'Basmati Paddy (Pusa 1121)',
      location: 'Tarawadi, Haryana (Kisan Silos)',
      quantity: '1,500 Quintals (150 Tons)',
      price: '₹3,950',
      totalValue: '₹59,25,000',
      assayReport: 'GI Tagged • Grain Length 8.4mm • 100% Purity',
      wdraStatus: 'Electronic Negotiable Warehouse Receipt (e-NWR)',
      badge: 'GI TAGGED'
    }
  ];

  const handleConfirmEscrow = () => {
    if (!selectedLotForEscrow) return;
    setLockedLots([...lockedLots, selectedLotForEscrow.id]);
    setToast(`🔒 ₹${selectedLotForEscrow.totalValue} locked into tripartite Escrow for ${selectedLotForEscrow.commodity}!`);
    setSelectedLotForEscrow(null);
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-between text-sm font-semibold animate-bounce">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Institutional Buyer Procurement Hub
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Direct institutional sourcing from verified FPOs with NABL assays and WDRA warehouse escrow settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Company:</span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md">
            {user?.company_name || 'ITC Agri-Business Division'}
          </span>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Sourced (YTD)
          </span>
          <div className="text-2xl font-bold text-slate-900">4,850 Tons</div>
          <span className="text-xs text-emerald-700 font-semibold mt-2 block">
            +18.4% direct FPO sourcing efficiency
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Active Escrow Contracts
          </span>
          <div className="text-2xl font-bold text-emerald-800">{lockedLots.length + 2} Contracts</div>
          <span className="text-xs text-slate-500 font-semibold mt-2 block">
            ₹1.42 Cr total protected liquidity
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            NABL Quality Compliance
          </span>
          <div className="text-2xl font-bold text-slate-900">99.4%</div>
          <span className="text-xs text-emerald-700 font-semibold mt-2 block">
            Zero lot rejections at godowns
          </span>
        </div>
      </div>

      {/* Verified FPO Lots List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Available Verified FPO Bulk Lots</h3>

        <div className="grid grid-cols-1 gap-4">
          {verifiedFPOLots.map((lot) => {
            const isLocked = lockedLots.includes(lot.id);

            return (
              <div
                key={lot.id}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md hover:border-emerald-200 transition flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                      {lot.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-700">#{lot.id}</span>
                    <span className="text-xs text-slate-500">• {lot.location}</span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900">{lot.commodity}</h4>
                  <p className="text-xs font-semibold text-emerald-700">{lot.fpo}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                    <div><span className="font-semibold text-slate-700">Volume:</span> {lot.quantity}</div>
                    <div><span className="font-semibold text-slate-700">Assay:</span> {lot.assayReport}</div>
                    <div className="sm:col-span-2 text-slate-500"><span className="font-semibold text-slate-700">Warehouse:</span> {lot.wdraStatus}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Lot Value</span>
                    <span className="text-2xl font-bold text-slate-900">{lot.totalValue}</span>
                    <span className="text-xs font-semibold text-slate-500 block">({lot.price} / qtl)</span>
                  </div>

                  {isLocked ? (
                    <span className="px-5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      Escrow Active & Locked
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedLotForEscrow(lot)}
                      className="w-full lg:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      Lock Escrow & Procure
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escrow Lock Confirmation Modal */}
      {selectedLotForEscrow && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700">lock</span>
              Confirm Escrow Lock
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Funds will be locked in an RBI-compliant escrow account and released only after digital receipt confirmation at the designated WDRA warehouse.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs mb-4">
              <p><span className="font-bold text-slate-700">Commodity:</span> {selectedLotForEscrow.commodity}</p>
              <p><span className="font-bold text-slate-700">FPO Partner:</span> {selectedLotForEscrow.fpo}</p>
              <p><span className="font-bold text-slate-700">Volume:</span> {selectedLotForEscrow.quantity}</p>
              <p><span className="font-bold text-slate-700">Escrow Lock Amount:</span> <span className="text-emerald-800 font-bold text-sm">{selectedLotForEscrow.totalValue}</span></p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedLotForEscrow(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEscrow}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                Lock Escrow Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
