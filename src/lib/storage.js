/**
 * Enhanced storage wrapper for Weeklet with CRUD operations
 */

// Default settings
const DEFAULT_SETTINGS = {
  startOfWeek: "Mon",
  rolloverDefault: true,
  compactMode: false
};

// Storage change listeners
const changeListeners = [];

// Debounced write operations to avoid sync quota churn
const writeQueue = new Map();
let writeTimer = null;

// Low-level storage functions
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
        console.error('Storage get error (localStorage):', error);
        reject(error);
      }
      return;
    }

    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Storage get error:', chrome.runtime.lastError);
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
  const data = typeof keyOrData === 'string' 
    ? { [keyOrData]: value }
    : keyOrData;

  return new Promise((resolve, reject) => {
    if (!chrome.storage) {
      console.warn('Chrome storage not available, using localStorage fallback');
      try {
        Object.entries(data).forEach(([key, val]) => {
          localStorage.setItem(key, JSON.stringify(val));
        });
        resolve();
      } catch (error) {
        console.error('Storage set error (localStorage):', error);
        reject(error);
      }
      return;
    }

    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        console.error('Storage set error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Debounced write function
function debouncedWrite() {
  if (writeTimer) {
    clearTimeout(writeTimer);
  }
  
  writeTimer = setTimeout(async () => {
    if (writeQueue.size === 0) return;
    
    const data = Object.fromEntries(writeQueue);
    writeQueue.clear();
    
    try {
      await storageSet(data);
      console.log('Debounced write completed for keys:', Object.keys(data));
    } catch (error) {
      console.error('Debounced write failed:', error);
    }
  }, 150);
}

// Task CRUD operations
export async function getTasksByDate(ymd) {
  try {
    const key = `tasks_${ymd}`;
    const tasks = await storageGet(key);
    return tasks || [];
  } catch (error) {
    console.error(`Failed to get tasks for ${ymd}:`, error);
    return [];
  }
}

export async function setTasksByDate(ymd, tasks) {
  try {
    const key = `tasks_${ymd}`;
    
    // Add to write queue for debouncing
    writeQueue.set(key, tasks);
    debouncedWrite();
    
    console.log(`Queued ${tasks.length} tasks for ${ymd}`);
  } catch (error) {
    console.error(`Failed to set tasks for ${ymd}:`, error);
    throw error;
  }
}

// Settings management
export async function getSettings() {
  try {
    const settings = await storageGet('settings');
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function setSettings(patch) {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...patch };
    
    writeQueue.set('settings', newSettings);
    debouncedWrite();
    
    console.log('Settings updated:', patch);
  } catch (error) {
    console.error('Failed to set settings:', error);
    throw error;
  }
}

// Storage change subscription
export function subscribe(callback) {
  changeListeners.push(callback);
  
  // Set up chrome.storage.onChanged listener (only once)
  if (changeListeners.length === 1 && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        const changedKeys = Object.keys(changes);
        console.log('Storage changed:', changedKeys);
        
        changeListeners.forEach(listener => {
          try {
            listener(changedKeys, changes);
          } catch (error) {
            console.error('Storage change listener error:', error);
          }
        });
      }
    });
  }
  
  // Return unsubscribe function
  return () => {
    const index = changeListeners.indexOf(callback);
    if (index > -1) {
      changeListeners.splice(index, 1);
    }
  };
}
