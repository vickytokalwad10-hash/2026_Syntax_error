import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPendingQueueCount, processSyncQueue } from '../services/offlineDb';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const refreshPendingCount = async () => {
    const count = await getPendingQueueCount();
    setPendingSyncCount(count);
  };

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      await triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await processSyncQueue(async (item) => {
        // Sync handler depending on item.type
        console.log('Syncing item:', item.type, item.payload);
      });
      setLastSyncTime(new Date().toLocaleTimeString());
      await refreshPendingCount();
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        pendingSyncCount,
        isSyncing,
        lastSyncTime,
        refreshPendingCount,
        triggerSync
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
