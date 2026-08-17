import Dexie from 'dexie';

export const db = new Dexie('AgriPulseOfflineDB');

db.version(1).stores({
  cachedData: 'key, updatedAt',
  syncQueue: '++id, type, payload, createdAt, status'
});

// Helper to cache API response
export async function cacheData(key, data) {
  try {
    await db.cachedData.put({ key, data, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('Offline cache write failed:', e);
  }
}

// Helper to get cached API response
export async function getCachedData(key) {
  try {
    const item = await db.cachedData.get(key);
    return item ? item.data : null;
  } catch (e) {
    console.warn('Offline cache read failed:', e);
    return null;
  }
}

// Helper to enqueue offline action
export async function enqueueOfflineAction(type, payload) {
  try {
    const id = await db.syncQueue.add({
      type,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    return id;
  } catch (e) {
    console.warn('Sync queue enqueue failed:', e);
    return null;
  }
}

// Helper to get pending queue count
export async function getPendingQueueCount() {
  try {
    return await db.syncQueue.where('status').equals('pending').count();
  } catch (e) {
    return 0;
  }
}

// Helper to process sync queue
export async function processSyncQueue(syncHandler) {
  try {
    const pending = await db.syncQueue.where('status').equals('pending').toArray();
    for (const item of pending) {
      if (syncHandler) {
        await syncHandler(item);
      }
      await db.syncQueue.update(item.id, { status: 'synced', syncedAt: new Date().toISOString() });
    }
    return pending.length;
  } catch (e) {
    console.warn('Sync queue processing error:', e);
    return 0;
  }
}
