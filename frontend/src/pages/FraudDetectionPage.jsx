import React, { useState, useEffect } from 'react';

export default function FraudDetectionPage() {
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [scannerGstin, setScannerGstin] = useState('');
  const [scannerCompany, setScannerCompany] = useState('');
  const [scannerBidPrice, setScannerBidPrice] = useState('3850');
  const [scannerSpotPrice, setScannerSpotPrice] = useState('2840');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/fraud/buyers');
      if (res.ok) {
        const data = await res.json();
        setBuyers(data.buyers || []);
        if (data.buyers && data.buyers.length > 0) {
          setSelectedBuyer(data.buyers[0]);
        }
      }
    } catch (e) {
      // Fallback local list
      const fallbackList = [
        {
          buyer_id: 'BUY-001',
          company_name: 'ITC Agri-Business Division',
          representative: 'Rajesh Mehta',
          gstin: '07AAAAA0000A1Z5',
          gstin_status: 'Active & Verified',
          pan_verified: true,
          trust_score: 98,
          category: 'TRUSTED',
          tenure_months: 42,
          total_volume_tons: 24800,
          escrow_fulfillment_rate: 100.0,
          avg_payment_delay_days: 0.2,
          dispute_count: 0,
          bid_anomaly_flags: 'None. Bidding strictly correlates with NCDEX indices.',
          badges: ['WDRA Certified Partner', '100% Escrow Succeeded', 'Institutional Leader']
        },
        {
          buyer_id: 'BUY-002',
          company_name: 'Adani Wilmar Edible Oils Ltd',
          representative: 'Sunil Verma',
          gstin: '24AAACA1234A1Z9',
          gstin_status: 'Active & Verified',
          pan_verified: true,
          trust_score: 96,
          category: 'TRUSTED',
          tenure_months: 36,
          total_volume_tons: 18200,
          escrow_fulfillment_rate: 99.4,
          avg_payment_delay_days: 0.4,
          dispute_count: 0,
          bid_anomaly_flags: 'None. Verified refinery buyer.',
          badges: ['APEDA Registered', 'Zero Default History']
        },
        {
          buyer_id: 'BUY-003',
          company_name: 'Kalyani Agro Commodities Trading',
          representative: 'Praveen Kalyani',
          gstin: '08BBBPC4567B1Z2',
          gstin_status: 'Active (Recent Registration < 60 days)',
          pan_verified: true,
          trust_score: 68,
          category: 'RISKY',
          tenure_months: 2,
          total_volume_tons: 350,
          escrow_fulfillment_rate: 84.0,
          avg_payment_delay_days: 3.8,
          dispute_count: 1,
          bid_anomaly_flags: 'Bid prices 8-12% above spot with delayed warehouse receipt endorsements.',
          badges: ['New Trading Account', 'Manual Escrow Verification Advised']
        },
        {
          buyer_id: 'BUY-004',
          company_name: 'Sunrise Agro Commodities LLC (Shell Entity Flag)',
          representative: 'Amit S. (Unverified Alias)',
          gstin: '06ZZZZZ9999Z1Z0',
          gstin_status: 'Cancelled / Suspended by GST Authority',
          pan_verified: false,
          trust_score: 24,
          category: 'SUSPICIOUS',
          tenure_months: 1,
          total_volume_tons: 0,
          escrow_fulfillment_rate: 0.0,
          avg_payment_delay_days: 14.0,
          dispute_count: 4,
          bid_anomaly_flags: 'Bidding +35% above spot without locking escrow funds; unbacked post-dated cheques requested.',
          badges: ['⚠️ Flagged Fraud Entity', 'Suspended GSTIN', 'Do Not Dispatch']
        }
      ];
      setBuyers(fallbackList);
      setSelectedBuyer(fallbackList[0]);
    }
  };

  const runFraudScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/fraud/analyze-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: scannerCompany || 'Evaluated Entity',
          gstin: scannerGstin || '27XXXXX0000X1Z5',
          bid_price: Number(scannerBidPrice),
          spot_price: Number(scannerSpotPrice),
          tenure_months: 2,
          completed_escrows: 0,
          dispute_count: Number(scannerBidPrice) > Number(scannerSpotPrice) * 1.25 ? 2 : 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setScanResult(data.analysis);
      }
    } catch (e) {
      // Local fallback logic
      const diff = ((Number(scannerBidPrice) - Number(scannerSpotPrice)) / Number(scannerSpotPrice)) * 100;
      const score = diff > 25 ? 32 : diff > 10 ? 64 : 92;
      const cat = score >= 85 ? 'TRUSTED' : score >= 50 ? 'RISKY' : 'SUSPICIOUS';

      setScanResult({
        buyer_id: 'SCAN-LIVE',
        company_name: scannerCompany || 'Evaluated Entity',
        gstin: scannerGstin || '27XXXXX0000X1Z5',
        trust_score: score,
        category: cat,
        risk_flags:
          diff > 25
            ? ['Abnormally inflated bid price (+25% above APMC spot) — typical fake demand scam pattern.', 'Zero completed escrow transactions on record.']
            : diff > 10
            ? ['Bid is 10-25% above mandi average. Require 100% upfront escrow lock.']
            : ['Standard market pricing alignment.'],
        recommendation:
          cat === 'TRUSTED'
            ? 'Safe to transact via standard Escrow.'
            : cat === 'RISKY'
            ? 'Proceed with caution. Enforce 100% upfront digital escrow before releasing gate pass.'
            : '⚠️ CRITICAL FRAUD RISK: Do not dispatch grain without verified bank guarantee.'
      });
    } finally {
      setScanning(false);
    }
  };

  const getCategoryBadge = (cat) => {
    if (cat === 'TRUSTED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
          TRUSTED (Score 85-100)
        </span>
      );
    }
    if (cat === 'RISKY') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <span className="material-symbols-outlined text-[16px] text-amber-700">warning</span>
          RISKY (Score 50-84)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 animate-pulse">
        <span className="material-symbols-outlined text-[16px] text-red-700">dangerous</span>
        SUSPICIOUS / SCAM (Score 0-49)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-emerald-700 text-[32px]">shield</span>
          AI Fraud & Scam Detection Shield
        </h2>
        <p className="text-sm md:text-base text-slate-500 max-w-3xl">
          Realtime behavioral risk radar analyzing buyer GSTIN authentication, escrow payment track record, and anomalous high-bidding patterns to classify parties as <strong>Trusted</strong>, <strong>Risky</strong>, or <strong>Suspicious</strong>.
        </p>
      </div>

      {/* 3 Status Category Explanation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-700 text-[24px]">verified_user</span>
            <h3 className="text-sm font-bold text-emerald-900">TRUSTED BUYER (85 - 100)</h3>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Active GSTIN/PAN, &gt;99% completed escrow history, 0 defaults, verified warehouse delivery records (e.g. ITC, Adani Wilmar).
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-700 text-[24px]">warning_amber</span>
            <h3 className="text-sm font-bold text-amber-900">RISKY ENTITY (50 - 84)</h3>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            New trading accounts (&lt;90 days), sporadic payment delays, or uncharacteristic bid volatility. 100% upfront escrow mandatory.
          </p>
        </div>

        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-red-700 text-[24px]">report</span>
            <h3 className="text-sm font-bold text-red-900">SUSPICIOUS / SCAM (0 - 49)</h3>
          </div>
          <p className="text-xs text-red-800 leading-relaxed">
            Suspended GSTIN, inflated bids (+35% above spot) with credit-terms request, fake identities, or payment default records.
          </p>
        </div>
      </div>

      {/* Live AI Scanner Tool */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-700">radar</span>
          Live Buyer Anomaly & Fraud Risk Scanner
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company / Entity Name</label>
            <input
              type="text"
              value={scannerCompany}
              onChange={(e) => setScannerCompany(e.target.value)}
              placeholder="e.g. Apex Global Traders"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
            <input
              type="text"
              value={scannerGstin}
              onChange={(e) => setScannerGstin(e.target.value)}
              placeholder="e.g. 06AAAAA0000A1Z5"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Offered Bid Price (₹/qtl)</label>
            <input
              type="number"
              value={scannerBidPrice}
              onChange={(e) => setScannerBidPrice(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">APMC Mandi Spot (₹/qtl)</label>
            <input
              type="number"
              value={scannerSpotPrice}
              onChange={(e) => setScannerSpotPrice(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:outline-emerald-600"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={runFraudScan}
            disabled={scanning}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">security</span>
            {scanning ? 'Auditing Bidding Vectors...' : 'Audit Entity for Fraud Risk'}
          </button>
        </div>

        {/* Scan Result Output */}
        {scanResult && (
          <div
            className={`mt-4 p-5 rounded-xl border transition-all ${
              scanResult.category === 'TRUSTED'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : scanResult.category === 'RISKY'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-red-50/90 border-red-300 text-red-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-600">
                  Audit Verdict for {scanResult.company_name}
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  AI Trust Score: <span className="text-xl font-extrabold">{scanResult.trust_score} / 100</span>
                </h4>
              </div>
              <div>{getCategoryBadge(scanResult.category)}</div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold">{scanResult.recommendation}</p>
              {scanResult.risk_flags && scanResult.risk_flags.length > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="font-bold text-slate-700">Flagged Risk Vectors:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                    {scanResult.risk_flags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Directory of Monitored Institutional Buyers */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monitored Institutional Buyers & Trading Houses</h3>
            <p className="text-xs text-slate-500">Live trust status across 4 monitored trading partners on AgriPulse exchange</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Active Shield Protection
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {buyers.map((b) => (
            <div
              key={b.buyer_id}
              className={`p-5 rounded-xl border transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${
                b.category === 'TRUSTED'
                  ? 'bg-white border-slate-200 hover:border-emerald-300'
                  : b.category === 'RISKY'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-red-50/60 border-red-200'
              }`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {getCategoryBadge(b.category)}
                  <span className="text-xs font-bold text-slate-700">#{b.buyer_id}</span>
                  <span className="text-xs text-slate-500">• GSTIN: {b.gstin} ({b.gstin_status})</span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{b.company_name}</h4>
                <p className="text-xs text-slate-600">Representative: {b.representative} • Operating Tenure: {b.tenure_months} Months</p>

                <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                  <span><strong>Volume Traded:</strong> {b.total_volume_tons} Tons</span>
                  <span>•</span>
                  <span><strong>Escrow Fulfillment:</strong> {b.escrow_fulfillment_rate}%</span>
                  <span>•</span>
                  <span><strong>Disputes:</strong> {b.dispute_count}</span>
                </div>

                <div className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                  🔍 Behavioral AI Audit: {b.bid_anomaly_flags}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trust Score</span>
                  <span
                    className={`text-2xl font-bold ${
                      b.category === 'TRUSTED'
                        ? 'text-emerald-700'
                        : b.category === 'RISKY'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {b.trust_score}<span className="text-xs font-normal text-slate-500">/100</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 justify-end">
                  {b.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.category === 'TRUSTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.category === 'RISKY'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
