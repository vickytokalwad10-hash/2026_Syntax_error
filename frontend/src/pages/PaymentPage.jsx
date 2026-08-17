import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useEscrow } from '../context/EscrowContext';

export default function PaymentPage() {
  const { t } = useLanguage();
  const { user, role } = useAuth();
  const { isOnline } = useNetwork();
  const { transactions: escrowTxns, setActiveReceipt, releaseEscrowPayment, isProcessing } = useEscrow();

  // Payment Checkout State
  const [amount, setAmount] = useState('284000'); // ₹2,84,000 default (100 Quintals Wheat)
  const [lotTitle, setLotTitle] = useState('100 Qtl Sharbati Wheat (Lot #LOT-9021)');
  const [sellerName, setSellerName] = useState('Ramesh Devidas Patil (Karnal West)');
  const [paymentRail, setPaymentRail] = useState('escrow'); // 'razorpay', 'upi', 'escrow'

  // 2FA High-Value Modal State
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [orderId, setOrderId] = useState(null);

  // Status & Transaction List
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    const amtFloat = parseFloat(amount);
    const generatedOrderId = `ord_rzp_${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedOrderId);

    // If amount >= 50,000, trigger mandatory 2FA OTP security step
    if (amtFloat >= 50000) {
      setRequires2FA(true);
      setLoading(false);
      setToast('🔐 High-Value Agricultural Payment detected: 2FA Authorization Required (Use PIN 123456).');
      return;
    }

    finalizePayment(generatedOrderId);
  };

  const handleVerify2FA = () => {
    if (otpCode !== '123456' && otpCode.length !== 6) {
      setToast('⚠️ Invalid OTP Code. Use sandbox PIN 123456.');
      return;
    }
    setRequires2FA(false);
    finalizePayment(orderId);
  };

  const finalizePayment = (targetOrderId) => {
    setLoading(true);
    setTimeout(() => {
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        order_id: targetOrderId,
        lot: lotTitle,
        seller: sellerName,
        buyer: user?.name || 'Authorized Buyer',
        amount: parseFloat(amount),
        payment_method: paymentRail === 'razorpay' ? 'Razorpay Sandbox Gateway' : paymentRail === 'upi' ? 'Instant UPI QR (BHIM/GPay)' : 'Smart Agri Escrow Vault',
        status: paymentRail === 'escrow' ? 'Escrow Locked' : 'Settled to Farmer',
        date: 'Just now',
        badge: paymentRail === 'escrow' ? 'Protected' : 'Completed'
      };

      setTransactions([newTx, ...transactions]);
      setLoading(false);
      setToast(`🎉 Payment of ₹${parseFloat(amount).toLocaleString('en-IN')} successfully verified! Gateway Ref: ${targetOrderId}`);
      setTimeout(() => setToast(null), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-brand-700 text-white px-4 py-3 rounded-2xl shadow-floating flex items-center justify-between text-xs font-bold animate-in zoom-in-95">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-brand-600 text-[32px]">payments</span>
          {t('payment.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
          {t('payment.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Checkout Terminal */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 space-y-4 border-l-4 border-l-brand-600">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-600">point_of_sale</span>
              {t('payment.escrowCheckout')}
            </h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentRail('razorpay')}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  paymentRail === 'razorpay' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                💳 Razorpay
              </button>
              <button
                type="button"
                onClick={() => setPaymentRail('upi')}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  paymentRail === 'upi' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                📱 Instant UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentRail('escrow')}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  paymentRail === 'escrow' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                🔒 Smart Escrow
              </button>
            </div>

            <form onSubmit={handleInitiatePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item / Lot Description</label>
                <input
                  type="text"
                  value={lotTitle}
                  onChange={(e) => setLotTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient / Farmer Entity</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Amount (₹ INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-base text-slate-900 focus:outline-brand-600"
                    required
                  />
                </div>
                {parseFloat(amount) >= 50000 && (
                  <span className="text-[10px] text-amber-700 font-bold mt-1 block">
                    🛡️ High-value payment: 2FA OTP authentication required.
                  </span>
                )}
              </div>

              {/* UPI QR Display */}
              {paymentRail === 'upi' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <div className="w-32 h-32 bg-white border border-slate-300 rounded-xl mx-auto flex items-center justify-center text-4xl shadow-2xs">
                    📱
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Scan via GPay, PhonePe, Paytm, or BHIM
                  </span>
                  <span className="text-xs font-extrabold text-brand-800 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 inline-block">
                    UPI ID: agripulse.escrow@icici
                  </span>
                </div>
              )}

              {/* Escrow Guarantee Note */}
              {paymentRail === 'escrow' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] font-medium space-y-1">
                  <p className="font-extrabold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                    AgriPulse Escrow Lock Protocol
                  </p>
                  <p>{t('payment.rbiEscrowNotice')}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-glow-green transition active:scale-95 text-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {loading ? 'Processing Gateway...' : `Authorize ₹${parseFloat(amount || 0).toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Transaction Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-brand-600 text-[18px]">receipt_long</span>
                Live Transaction & Escrow Ledger
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Encrypted SHA-256
              </span>
            </div>

            <div className="space-y-3">
              {escrowTxns.map((tx) => (
                <div key={tx.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{tx.commodity}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            tx.status === 'Secured'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : tx.status === 'Released'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tx.status === 'Secured' ? '🔒 Escrow Locked' : tx.status === 'Released' ? '✅ Disbursed' : '⏳ Pending'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Seller: {tx.seller} • Buyer: {tx.buyer}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{tx.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{tx.createdAt}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px]">
                    <span className="font-mono text-[10px] text-slate-500">Vault: {tx.vaultRef}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(tx)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[10px] font-bold text-slate-800 transition"
                      >
                        📄 View Receipt
                      </button>
                      {tx.status === 'Secured' && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => releaseEscrowPayment(tx.id)}
                          className="px-2.5 py-1 bg-[#14532d] hover:bg-[#052e16] text-white rounded-lg text-[10px] font-bold transition shadow-xs"
                        >
                          {isProcessing ? 'Releasing...' : 'Release Funds ➔'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Mandatory Security Modal */}
      {requires2FA && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-floating border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mx-auto">
              🔐
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-slate-900">2FA Payment Authorization</h4>
              <p className="text-xs text-slate-500 font-medium">
                Enter authorization PIN for high-value agricultural transaction of ₹{parseFloat(amount).toLocaleString('en-IN')}.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder={t('payment.sandboxPin')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-center tracking-widest text-base focus:outline-brand-600"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRequires2FA(false)}
                  className="flex-1 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerify2FA}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs active:scale-95"
                >
                  Authorize & Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
