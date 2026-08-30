// utils/cacheUtil.js

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const cacheUtil = {
  // Save data to localStorage with timestamp
  set(key, data) {
    const cache = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cache));
  },

  // Get data from localStorage if fresh
  get(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isFresh = Date.now() - timestamp < CACHE_DURATION;
    
    return isFresh ? data : null;
  },

  // Check if cache exists
  has(key) {
    return localStorage.getItem(key) !== null;
  },

  // Remove specific cache
  remove(key) {
    localStorage.removeItem(key);
  },

  // Clear all app cache
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('furnihaven_')) {
        localStorage.removeItem(key);
      }
    });
  },
};