/**
 * Storage utilities - wrapper around chrome.storage.sync
 */

export async function storageGet(keys) {
  return new Promise((resolve, reject) => {
    if (!chrome.storage) {
      console.warn('Chrome storage not available, using localStorage fallback');
      try {
        if (typeof keys === 'string') {
          const value = localStorage.getItem(keys);
          resolve(value ? JSON.parse(value) : undefined);
        } else {
          const result = {};
          const keyArray = Array.isArray(keys) ? keys : Object.keys(keys);
          keyArray.forEach(key => {
            const value = localStorage.getItem(key);
            result[key] = value ? JSON.parse(value) : undefined;
          });
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
      return;
    }

    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        if (typeof keys === 'string') {
          resolve(result[keys]);
        } else {
          resolve(result);
        }
      }
    });
  });
}

export async function storageSet(keyOrData, value) {
  return new Promise((resolve, reject) => {
    const data = typeof keyOrData === 'string' 
      ? { [keyOrData]: value }
      : keyOrData;

    if (!chrome.storage) {
      console.warn('Chrome storage not available, using localStorage fallback');
      try {
        Object.entries(data).forEach(([key, val]) => {
          localStorage.setItem(key, JSON.stringify(val));
        });
        resolve();
      } catch (error) {
        reject(error);
      }
      return;
    }

    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
