import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useBackNavigation } from '../context/BackNavigationContext';
import { useEscrow } from '../context/EscrowContext';

export default function MarketplacePage() {
  const { user, role } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const { registerOverlay, unregisterOverlay } = useBackNavigation();
  const { createEscrowBid, confirmEscrowPayment, isProcessing } = useEscrow();
  const [activeCategory, setActiveCategory] = useState('All');
  const [biddingLot, setBiddingLot] = useState(null);
  const [checkoutTxn, setCheckoutTxn] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Register Bidding Modal with Back Navigation stack
  useEffect(() => {
    if (biddingLot) {
      registerOverlay('marketplaceBidModal', () => setBiddingLot(null));
    } else {
      unregisterOverlay('marketplaceBidModal');
    }
    return () => unregisterOverlay('marketplaceBidModal');
  }, [biddingLot, registerOverlay, unregisterOverlay]);

  // New Lot Form State
  const [lotCommodity, setLotCommodity] = useState('Sharbati Wheat (Grade A)');
  const [lotQuantity, setLotQuantity] = useState('250');
  const [lotPrice, setLotPrice] = useState('2850');
  const [lotSpecs, setLotSpecs] = useState('Moisture 11.8%, Protein 13.2%, WDRA Godown #4');

  const [lots, setLots] = useState([
    {
      id: 'LOT-9021',
      category: 'Grains',
      commodity: 'Wheat (Sharbati Gold)',
      seller: 'Karnal FPO Cooperative (120 Farmers)',
      location: 'Karnal, Haryana',
      quantity: '450 Quintals',
      price: '₹2,840',
      priceRaw: 2840,
      badge: 'NABL Certified',
      badgeType: 'success',
      status: 'Open for Bids',
      topBid: '₹2,860/qtl',
      topBidder: 'ITC Agri-Business',
      bidderTrust: 'TRUSTED',
      bidderTrustScore: 98,
      specs: 'Moisture: 11.2% • Protein: 13.4% • Foreign Matter: <0.5%'
    },
    {
      id: 'LOT-9022',
      category: 'Grains',
      commodity: 'Basmati Rice (Pusa 1121)',
      seller: 'Tarawadi Basmati Growers Assoc.',
      location: 'Tarawadi, Haryana',
      quantity: '600 Quintals',
      price: '₹3,950',
      priceRaw: 3950,
      badge: 'GI Tagged',
      badgeType: 'success',
      status: 'Open for Bids',
      topBid: '₹3,975/qtl',
      topBidder: 'Adani Wilmar',
      bidderTrust: 'TRUSTED',
      bidderTrustScore: 96,
      specs: 'Grain Length: 8.4mm • Purity: 99.1% • Aged 12 Months'
    },
    {
      id: 'LOT-9023',
      category: 'Oilseeds',
      commodity: 'Mustard Seeds (Black Bold)',
      seller: 'Alwar Progressive Farmers Society',
      location: 'Alwar, Rajasthan',
      quantity: '300 Quintals',
      price: '₹5,780',
      priceRaw: 5780,
      badge: 'High Oil Yield',
      badgeType: 'neutral',
      status: 'Open for Bids',
      topBid: '₹5,810/qtl',
      topBidder: 'Kalyani Agro Trading',
      bidderTrust: 'RISKY',
      bidderTrustScore: 68,
      specs: 'Oil Content: 42.6% • Moisture: 7.8% • Cleaned'
    },
    {
      id: 'LOT-9024',
      category: 'Oilseeds',
      commodity: 'Soybean (Yellow Non-GMO)',
      seller: 'Malwa Organic Farmers Producer Co.',
      location: 'Indore, Madhya Pradesh',
      quantity: '800 Quintals',
      price: '₹4,890',
      priceRaw: 4890,
      badge: 'Escrow Locked',
      badgeType: 'warning',
      status: 'Matched',
      topBid: '₹4,920/qtl',
      topBidder: 'Ruchi Soya',
      bidderTrust: 'TRUSTED',
      bidderTrustScore: 94,
      specs: 'Moisture: 10.1% • Oil: 19.8% • Protein: 39.5%'
    }
  ]);

  const handlePublishLot = (e) => {
    e.preventDefault();
    if (!lotCommodity || !lotQuantity || !lotPrice) return;

    const newLot = {
      id: `LOT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Grains',
      commodity: lotCommodity,
      seller: user?.name ? `${user.name} (Direct Farmer)` : 'Ramesh Devidas Patil (Karnal)',
      location: 'Karnal, Haryana',
      quantity: `${lotQuantity} Quintals`,
      price: `₹${parseFloat(lotPrice).toLocaleString('en-IN')}`,
      priceRaw: parseFloat(lotPrice),
      badge: 'Farmer Verified',
      badgeType: 'success',
      status: 'Open for Bids',
      topBid: 'Awaiting Bids',
      topBidder: '—',
      bidderTrust: 'TRUSTED',
      bidderTrustScore: 100,
      specs: lotSpecs
    };

    setLots([newLot, ...lots]);
    setLotCommodity('Sharbati Wheat (Grade A)');
    setLotQuantity('250');
    setLotPrice('2850');
    setToastMessage(`🎉 Lot #${newLot.id} published to National B2B Mandi Exchange!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    if (!bidAmount || !biddingLot) return;

    const numericBid = parseFloat(bidAmount);
    const txn = createEscrowBid(biddingLot, numericBid, user?.name || 'ITC Agri-Business');
    setCheckoutTxn(txn);
    setBiddingLot(null);
  };

  const handleConfirmEscrowLock = async () => {
    if (!checkoutTxn) return;
    const completed = await confirmEscrowPayment(checkoutTxn.id);
    
    // Update local lot state
    setLots(
      lots.map((l) => {
        if (l.id === checkoutTxn.lotId) {
          return {
            ...l,
            topBid: `₹${checkoutTxn.pricePerQtl.toLocaleString('en-IN')}/qtl`,
            topBidder: checkoutTxn.buyer,
            status: 'Matched',
            badge: 'Escrow Locked',
            badgeType: 'warning',
            bidderTrust: 'TRUSTED',
            bidderTrustScore: 100
          };
        }
        return l;
      })
    );

    setToastMessage(`🎉 Smart Escrow Secured! ₹${checkoutTxn.totalAmount.toLocaleString('en-IN')} locked for ${checkoutTxn.commodity}.`);
    setCheckoutTxn(null);
    setBidAmount('');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const filteredLots = activeCategory === 'All' ? lots : lots.filter((l) => l.category === activeCategory);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-[#14532d] text-white px-4 py-3 rounded-2xl shadow-floating flex items-center justify-between text-xs font-bold animate-in zoom-in-95">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Editorial Header */}
      <div className="pb-3 border-b border-[#e7e5e4]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#14532d] animate-pulse"></span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d]">
            {t('marketplace.title')}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1c1917] tracking-tight font-editorial mt-0.5 flex items-center gap-2">
          {t('marketplace.title')}
        </h2>
        <p className="text-xs sm:text-sm text-[#57534e] max-w-3xl mt-1 leading-relaxed">
          {t('marketplace.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Post Harvest Lot */}
        <div className="lg:col-span-4 space-y-4">
          <div className="paper-card p-4 sm:p-5 space-y-3.5 border-l-4 border-l-[#14532d]">
            <h3 className="font-extrabold text-[#1c1917] pb-2.5 border-b border-[#f5f2eb] flex items-center gap-2 font-editorial text-sm sm:text-base">
              <span className="material-symbols-outlined text-[#14532d]">add_business</span>
              {t('marketplace.listHarvest')}
            </h3>

            <form onSubmit={handlePublishLot} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#44403c] mb-1">Commodity & Grade</label>
                <input
                  type="text"
                  value={lotCommodity}
                  onChange={(e) => setLotCommodity(e.target.value)}
                  placeholder="e.g. Sharbati Wheat (Grade A)"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#44403c] mb-1">Volume (Quintals)</label>
                  <input
                    type="number"
                    value={lotQuantity}
                    onChange={(e) => setLotQuantity(e.target.value)}
                    placeholder="250"
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#44403c] mb-1">Base Price (₹/qtl)</label>
                  <input
                    type="number"
                    value={lotPrice}
                    onChange={(e) => setLotPrice(e.target.value)}
                    placeholder="2850"
                    className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-bold focus:outline-[#14532d]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#44403c] mb-1">Quality Assay & Warehouse</label>
                <textarea
                  value={lotSpecs}
                  onChange={(e) => setLotSpecs(e.target.value)}
                  rows="2"
                  placeholder="Moisture 11.5%, Foreign Matter <0.5%, WDRA Godown"
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl resize-none font-medium focus:outline-[#14532d]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#14532d] hover:bg-[#052e16] text-white font-extrabold rounded-xl shadow-xs transition btn-tap flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">publish</span>
                Publish Lot to Exchange
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Trading Floor Lots */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 border-b border-[#e7e5e4] pb-2.5 overflow-x-auto no-scrollbar">
            {['All', 'Grains', 'Oilseeds', 'Pulses'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#14532d] text-white shadow-xs'
                    : 'bg-white text-[#57534e] border border-[#e7e5e4] hover:bg-[#f5f2eb]'
                }`}
              >
                {cat === 'All' ? '🌐 All Active Lots' : `🌾 ${cat}`}
              </button>
            ))}
          </div>

          {/* Lots Grid */}
          <div className="space-y-3.5 sm:space-y-4">
            {filteredLots.map((lot) => (
              <div key={lot.id} className="paper-card p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#f5f2eb] gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#78716c] font-mono">{lot.id}</span>
                      <h4 className="text-base font-extrabold text-[#1c1917] font-editorial truncate">{lot.commodity}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                        {lot.badge}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-[#f0fdf4] text-[#14532d] border border-[#bbf7d0] flex items-center gap-1">
                        🏛️ Agmarknet Benchmark
                      </span>
                    </div>
                    <span className="text-xs text-[#57534e] block mt-0.5 truncate">
                      📍 {lot.seller} • {lot.location}
                    </span>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[9px] text-[#78716c] font-bold uppercase tracking-wider block">Reserve Price</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#14532d]">{lot.price}</span>
                    <span className="text-[10px] text-[#78716c] block">/ qtl ({lot.quantity})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-[#faf8f5] p-3 rounded-2xl border border-[#f5f2eb]">
                  <div>
                    <span className="text-[9px] text-[#78716c] block font-bold uppercase tracking-wider">Active Highest Bid</span>
                    <span className="font-extrabold text-sm text-[#1c1917]">{lot.topBid}</span>
                    <span className="text-[10px] sm:text-[11px] text-[#57534e] block mt-0.5 truncate">Bidder: {lot.topBidder}</span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] text-[#78716c] block font-bold uppercase tracking-wider">Buyer Trust Audit</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${
                        lot.bidderTrust === 'TRUSTED'
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : 'bg-amber-100 text-amber-950 border border-amber-300'
                      }`}>
                        {lot.bidderTrust === 'TRUSTED' ? '🛡️ TRUSTED BUYER' : '⚠️ RISKY / AUDIT'}
                      </span>
                      <span className="text-xs font-bold text-[#14532d]">{lot.bidderTrustScore}/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 text-xs">
                  <span className="text-[#78716c] text-[11px] font-medium truncate max-w-md">📋 {lot.specs}</span>
                  <button
                    onClick={() => {
                      setBiddingLot(lot);
                      setBidAmount(lot.priceRaw + 20);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-[#14532d] hover:bg-[#052e16] text-white text-xs font-bold rounded-xl shadow-xs transition btn-tap text-center"
                  >
                    Place Direct Escrow Bid ➔
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Official NDSAP Open Data Attribution Banner */}
          <div className="p-3.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#57534e]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#14532d] text-[18px]">verified</span>
              <span>Source: Agmarknet, Ministry of Agriculture & Farmers Welfare, Government of India (via data.gov.in)</span>
            </div>
            <span className="text-[10px] font-bold text-[#78716c] shrink-0 bg-white px-2 py-1 rounded-lg border border-[#e7e5e4]">
              NDSAP Open Data • Updated Daily
            </span>
          </div>
        </div>
      </div>

      {/* Bidding Modal */}
      {biddingLot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-floating border border-[#e7e5e4] animate-in zoom-in-95 space-y-4">
            <h4 className="text-base font-extrabold text-[#1c1917] font-editorial">
              Place B2B Bid: {biddingLot.commodity}
            </h4>
            <p className="text-xs text-[#57534e]">
              Current highest bid is <strong>{biddingLot.topBid}</strong> by {biddingLot.topBidder}.
            </p>

            <form onSubmit={handlePlaceBid} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#44403c] mb-1">Your Direct Bid (₹/qtl)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full p-2.5 bg-[#faf8f5] border border-[#e7e5e4] rounded-xl font-extrabold text-base text-[#1c1917] focus:outline-[#14532d]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBiddingLot(null)}
                  className="flex-1 py-2 font-bold text-[#78716c] hover:bg-[#f5f2eb] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#14532d] hover:bg-[#052e16] text-white font-bold rounded-xl shadow-xs"
                >
                  Proceed to Escrow ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Escrow Payment Authorization Modal */}
      {checkoutTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-[#e7e5e4] animate-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-[#f5f2eb]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#14532d] text-2xl">shield_lock</span>
                <div>
                  <h3 className="text-base font-extrabold text-[#1c1917] font-editorial">
                    Smart Escrow Checkout
                  </h3>
                  <span className="text-[10px] font-mono text-[#78716c]">
                    Order #{checkoutTxn.id} • RBI-Compliant Tripartite Vault
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCheckoutTxn(null)}
                className="w-7 h-7 rounded-full bg-[#f5f2eb] hover:bg-[#e7e5e4] text-[#78716c] flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Clear Simulation Notice */}
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="text-[11px] font-extrabold text-amber-900 flex items-center justify-center gap-1">
                <span>🛡️</span> Demo Payment — No Real Funds Transferred
              </span>
            </div>

            {/* Order Summary */}
            <div className="bg-[#faf8f5] p-3.5 rounded-2xl border border-[#f5f2eb] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#78716c]">Commodity & Lot:</span>
                <span className="font-extrabold text-[#1c1917]">{checkoutTxn.commodity} ({checkoutTxn.lotId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Farmer / Seller:</span>
                <span className="font-bold text-[#1c1917]">{checkoutTxn.seller}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Procuring Entity:</span>
                <span className="font-bold text-[#1c1917]">{checkoutTxn.buyer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Volume:</span>
                <span className="font-extrabold text-[#1c1917]">{checkoutTxn.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Agreed Rate:</span>
                <span className="font-extrabold text-[#14532d]">₹{checkoutTxn.pricePerQtl.toLocaleString('en-IN')} / qtl</span>
              </div>
              <div className="pt-2 border-t border-[#e7e5e4] flex justify-between items-center text-sm font-extrabold">
                <span className="text-[#1c1917]">Escrow Lock Amount:</span>
                <span className="text-[#14532d] text-base">₹{checkoutTxn.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Simulated Checkout Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleConfirmEscrowLock}
                disabled={isProcessing}
                className="w-full py-3 bg-[#14532d] hover:bg-[#052e16] text-white font-extrabold rounded-xl shadow-xs transition btn-tap flex items-center justify-center gap-2 text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {isProcessing ? 'Securing Escrow Vault Funds...' : 'Authorize Demo Payment & Lock Escrow'}
              </button>
              <button
                onClick={() => setCheckoutTxn(null)}
                className="w-full py-2 bg-[#f5f2eb] hover:bg-[#e7e5e4] text-[#78716c] font-bold rounded-xl text-xs"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
