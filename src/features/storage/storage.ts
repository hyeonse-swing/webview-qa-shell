export interface StorageCheckResult {
  name: string;
  supported: boolean;
  persisted: boolean;
  value?: string;
  error?: string;
}

export async function runStorageChecks(): Promise<StorageCheckResult[]> {
  const key = 'webview-qa-storage-check';
  const value = new Date().toISOString();
  const results: StorageCheckResult[] = [];

  results.push(checkWebStorage('localStorage', key, value));
  results.push(checkWebStorage('sessionStorage', key, value));
  results.push(await checkIndexedDb(key, value));
  results.push(checkCookie(key, value));

  return results;
}

function checkWebStorage(kind: 'localStorage' | 'sessionStorage', key: string, value: string): StorageCheckResult {
  try {
    const storage = window[kind];
    storage.setItem(key, value);
    const stored = storage.getItem(key);

    return {
      name: kind,
      supported: true,
      persisted: stored === value,
      value: stored ?? undefined,
    };
  } catch (error) {
    return {
      name: kind,
      supported: false,
      persisted: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function checkCookie(key: string, value: string): StorageCheckResult {
  try {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    const persisted = document.cookie.includes(`${key}=`);

    return {
      name: 'cookie',
      supported: persisted,
      persisted,
      value: persisted ? value : undefined,
    };
  } catch (error) {
    return {
      name: 'cookie',
      supported: false,
      persisted: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function checkIndexedDb(key: string, value: string): Promise<StorageCheckResult> {
  if (!window.indexedDB) {
    return Promise.resolve({ name: 'IndexedDB', supported: false, persisted: false });
  }

  return new Promise((resolve) => {
    const request = window.indexedDB.open('webview-qa-console', 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore('checks');
    };

    request.onerror = () => {
      resolve({
        name: 'IndexedDB',
        supported: false,
        persisted: false,
        error: request.error?.message,
      });
    };

    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction('checks', 'readwrite');
      const store = transaction.objectStore('checks');
      store.put(value, key);

      transaction.oncomplete = () => {
        const readTransaction = database.transaction('checks', 'readonly');
        const readRequest = readTransaction.objectStore('checks').get(key);

        readRequest.onsuccess = () => {
          resolve({
            name: 'IndexedDB',
            supported: true,
            persisted: readRequest.result === value,
            value: readRequest.result,
          });
          database.close();
        };

        readRequest.onerror = () => {
          resolve({
            name: 'IndexedDB',
            supported: true,
            persisted: false,
            error: readRequest.error?.message,
          });
          database.close();
        };
      };
    };
  });
}
