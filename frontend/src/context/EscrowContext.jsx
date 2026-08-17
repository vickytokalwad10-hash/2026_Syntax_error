import React, { createContext, useContext, useState, useEffect } from 'react';
import { cacheData, getCachedData } from '../services/offlineDb';

const EscrowContext = createContext();

const INITIAL_ESCROW_TXNS = [
  {
    id: 'TXN-2026-8941',
    lotId: 'LOT-9024',
    commodity: 'Soybean (Yellow Non-GMO)',
    seller: 'Malwa Organic Farmers Producer Co.',
    sellerPhone: '+91 98260 44120',
    buyer: 'Ruchi Soya Industries Ltd.',
    buyerGstin: '23AAACR7721N1Z5',
    quantity: '800 Quintals',
    quantityQuintals: 800,
    pricePerQtl: 4920,
    totalAmount: 3936000,
    status: 'Secured', // 'Pending' | 'Secured' | 'Released'
    createdAt: '17 Aug 2026, 02:45 PM',
    securedAt: '17 Aug 2026, 03:00 PM',
    releasedAt: null,
    vaultRef: 'ESC-RBI-IND-9942',
    isDemo: true
  },
  {
    id: 'TXN-2026-8940',
    lotId: 'LOT-9018',
    commodity: 'Basmati Rice (Pusa 1121)',
    seller: 'Tarawadi Basmati Growers Assoc.',
    sellerPhone: '+91 94160 11984',
    buyer: 'Adani Wilmar Agri Procurement',
    buyerGstin: '06AABCA1299P1ZK',
    quantity: '600 Quintals',
    quantityQuintals: 600,
    pricePerQtl: 3975,
    totalAmount: 2385000,
    status: 'Released',
    createdAt: '15 Aug 2026, 11:15 AM',
    securedAt: '15 Aug 2026, 11:45 AM',
    releasedAt: '16 Aug 2026, 04:30 PM',
    vaultRef: 'ESC-RBI-IND-9881',
    isDemo: true
  }
];

export function EscrowProvider({ children }) {
  const [transactions, setTransactions] = useState(INITIAL_ESCROW_TXNS);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const saved = localStorage.getItem('agripulse_escrow_txns');
      if (saved) {
        setTransactions(JSON.parse(saved));
        return;
      }
      const cached = await getCachedData('escrow_transactions');
      if (cached && Array.isArray(cached) && cached.length > 0) {
        setTransactions(cached);
      }
    } catch (e) {
      console.warn('Could not load cached escrow txns:', e);
    }
  };

  const saveTransactions = async (txns) => {
    setTransactions(txns);
    try {
      localStorage.setItem('agripulse_escrow_txns', JSON.stringify(txns));
      await cacheData('escrow_transactions', txns);
    } catch (e) {
      console.warn('Could not cache escrow txns:', e);
    }
  };

  // 1. Create New Escrow Bid & Transaction
  const createEscrowBid = (lot, bidAmountPerQtl, buyerName = 'ITC Agri-Business', buyerGstin = '06AAACI1122K1Z9') => {
    const numericBid = parseFloat(bidAmountPerQtl) || lot.priceRaw;
    const qtyNum = parseFloat(lot.quantity) || 100;
    const totalAmount = Math.round(numericBid * qtyNum);
    const txnId = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTxn = {
      id: txnId,
      lotId: lot.id,
      commodity: lot.commodity,
      seller: lot.seller,
      sellerPhone: '+91 98120 77651',
      buyer: buyerName,
      buyerGstin: buyerGstin,
      quantity: lot.quantity,
      quantityQuintals: qtyNum,
      pricePerQtl: numericBid,
      totalAmount: totalAmount,
      status: 'Pending',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      securedAt: null,
      releasedAt: null,
      vaultRef: `ESC-RBI-IND-${Math.floor(1000 + Math.random() * 9000)}`,
      isDemo: true
    };

    const updated = [newTxn, ...transactions];
    saveTransactions(updated);
    return newTxn;
  };

  // 2. Lock & Confirm Payment (Simulated 1.5s Authorization)
  const confirmEscrowPayment = async (txnId) => {
    setIsProcessing(true);
    await new Promise((res) => setTimeout(res, 1400)); // Simulated processing

    const updated = transactions.map((t) => {
      if (t.id === txnId) {
        return {
          ...t,
          status: 'Secured',
          securedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        };
      }
      return t;
    });

    await saveTransactions(updated);
    setIsProcessing(false);
    const matched = updated.find((t) => t.id === txnId);
    if (matched) setActiveReceipt(matched);
    return matched;
  };

  // 3. Release Funds to Farmer
  const releaseEscrowPayment = async (txnId) => {
    setIsProcessing(true);
    await new Promise((res) => setTimeout(res, 1000));

    const updated = transactions.map((t) => {
      if (t.id === txnId) {
        return {
          ...t,
          status: 'Released',
          releasedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        };
      }
      return t;
    });

    await saveTransactions(updated);
    setIsProcessing(false);
    const matched = updated.find((t) => t.id === txnId);
    if (matched) setActiveReceipt(matched);
    return matched;
  };

  return (
    <EscrowContext.Provider
      value={{
        transactions,
        activeReceipt,
        setActiveReceipt,
        isProcessing,
        createEscrowBid,
        confirmEscrowPayment,
        releaseEscrowPayment
      }}
    >
      {children}
    </EscrowContext.Provider>
  );
}

export function useEscrow() {
  const context = useContext(EscrowContext);
  if (!context) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
}
