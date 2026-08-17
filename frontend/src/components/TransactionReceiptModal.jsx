import React from 'react';
import { useEscrow } from '../context/EscrowContext';

export default function TransactionReceiptModal() {
  const { activeReceipt, setActiveReceipt, releaseEscrowPayment, isProcessing } = useEscrow();

  if (!activeReceipt) return null;

  const isSecured = activeReceipt.status === 'Secured';
  const isReleased = activeReceipt.status === 'Released';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-[#e7e5e4] animate-in zoom-in-95 space-y-4 relative overflow-hidden">
        {/* Top Watermark & Close */}
        <div className="flex justify-between items-start pb-3 border-b border-[#f5f2eb]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#14532d] text-2xl">verified_user</span>
            <div>
              <h3 className="text-base font-extrabold text-[#1c1917] font-editorial">
                AgriPulse Smart Escrow Receipt
              </h3>
              <span className="text-[10px] font-mono text-[#78716c] block">
                REF: {activeReceipt.id} • {activeReceipt.vaultRef}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            className="w-8 h-8 rounded-full bg-[#f5f2eb] hover:bg-[#e7e5e4] text-[#78716c] flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Demo Notice Banner */}
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <span className="text-[11px] font-extrabold text-amber-900 flex items-center justify-center gap-1">
            <span>🛡️</span> Demo Payment — No Real Funds Transferred
          </span>
        </div>

        {/* Transaction Details Grid */}
        <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#f5f2eb] space-y-2.5 text-xs">
          <div className="flex justify-between pb-1.5 border-b border-[#e7e5e4]">
            <span className="text-[#78716c]">Commodity & Grade:</span>
            <span className="font-extrabold text-[#1c1917] text-right">{activeReceipt.commodity}</span>
          </div>

          <div className="flex justify-between pb-1.5 border-b border-[#e7e5e4]">
            <span className="text-[#78716c]">Seller (Farmer/FPO):</span>
            <span className="font-bold text-[#1c1917] text-right">{activeReceipt.seller}</span>
          </div>

          <div className="flex justify-between pb-1.5 border-b border-[#e7e5e4]">
            <span className="text-[#78716c]">Buyer Entity:</span>
            <span className="font-bold text-[#1c1917] text-right">{activeReceipt.buyer}</span>
          </div>

          <div className="flex justify-between pb-1.5 border-b border-[#e7e5e4]">
            <span className="text-[#78716c]">Volume Traded:</span>
            <span className="font-extrabold text-[#1c1917]">{activeReceipt.quantity}</span>
          </div>

          <div className="flex justify-between pb-1.5 border-b border-[#e7e5e4]">
            <span className="text-[#78716c]">Clearing Rate:</span>
            <span className="font-extrabold text-[#14532d]">₹{activeReceipt.pricePerQtl.toLocaleString('en-IN')}/qtl</span>
          </div>

          <div className="flex justify-between pt-1 text-sm font-extrabold">
            <span className="text-[#1c1917]">Total Escrow Value:</span>
            <span className="text-[#14532d] text-base">₹{activeReceipt.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Status Stamp Seal */}
        <div className="p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs bg-white">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isReleased ? 'bg-blue-600' : isSecured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`}></span>
            <div>
              <span className="text-[10px] text-[#78716c] uppercase font-bold block">Current Escrow State</span>
              <span className="font-black text-sm text-[#1c1917]">
                {isReleased ? '🎉 DISBURSED / RELEASED' : isSecured ? '🔒 SECURED IN ESCROW' : '⏳ PENDING AUTHORIZATION'}
              </span>
            </div>
          </div>

          <div className="text-right text-[10px] text-[#78716c]">
            <span>{isReleased ? activeReceipt.releasedAt : activeReceipt.securedAt || activeReceipt.createdAt}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          {isSecured && (
            <button
              onClick={() => releaseEscrowPayment(activeReceipt.id)}
              disabled={isProcessing}
              className="w-full py-3 bg-[#14532d] hover:bg-[#052e16] text-white font-extrabold rounded-xl shadow-xs transition btn-tap flex items-center justify-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              {isProcessing ? 'Processing Disbursement...' : 'Buyer Action: Release Payment to Farmer'}
            </button>
          )}

          <button
            onClick={() => setActiveReceipt(null)}
            className="w-full py-2.5 bg-[#f5f2eb] hover:bg-[#e7e5e4] text-[#1c1917] font-bold rounded-xl text-xs transition"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
