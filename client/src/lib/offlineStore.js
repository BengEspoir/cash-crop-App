const DB_NAME = "agriculnet-offline";
const DB_VERSION = 1;
const STORES = ["drafts", "pendingMutations", "cachedUserData", "syncMetadata"];
const LOCAL_DRAFT_PREFIX = "agriculnet.active-listing-draft.v1:";

export const getOfflineDraftKey = (userId) => `${LOCAL_DRAFT_PREFIX}${userId}:listing:new`;

function openDatabase() {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("IndexedDB is unavailable"));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      for (const store of STORES) {
        if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(storeName, mode, action) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export function saveOfflineRecord(storeName, record) {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (!STORES.includes(storeName)) throw new Error("Unsupported offline store");
  return withStore(storeName, "readwrite", (store) => store.put({ ...record, updatedAt: new Date().toISOString() }));
}

export function getOfflineRecord(storeName, id) {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (!STORES.includes(storeName)) throw new Error("Unsupported offline store");
  return withStore(storeName, "readonly", (store) => store.get(id));
}

export function deleteOfflineRecord(storeName, id) {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (!STORES.includes(storeName)) throw new Error("Unsupported offline store");
  return withStore(storeName, "readwrite", (store) => store.delete(id));
}

export function listOfflineRecords(storeName) {
  if (typeof indexedDB === "undefined") return Promise.resolve([]);
  if (!STORES.includes(storeName)) throw new Error("Unsupported offline store");
  return withStore(storeName, "readonly", (store) => store.getAll());
}

export async function clearOfflineUserData(userId) {
  if (!userId) return;
  if (typeof indexedDB !== "undefined") {
    const database = await openDatabase();
    for (const storeName of STORES) {
      await new Promise((resolve, reject) => {
        const request = database.transaction(storeName, "readwrite").objectStore(storeName).openCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return resolve();
          if (cursor.value?.userId === userId) cursor.delete();
          cursor.continue();
        };
        request.onerror = () => reject(request.error);
      });
    }
    database.close();
  }
  if (typeof localStorage !== "undefined") localStorage.removeItem(getOfflineDraftKey(userId));
}
