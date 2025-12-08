/**
 * RPC Optimizer - Background Service Worker
 * Handles background tasks and caching
 */

// Cache for RPC results
const rpcCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached results or return null
 */
function getCached(chain) {
  const cached = rpcCache.get(chain);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }
  return null;
}

/**
 * Store results in cache
 */
function setCache(chain, results) {
  rpcCache.set(chain, {
    results,
    timestamp: Date.now(),
  });
}

/**
 * Handle messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCache') {
    const cached = getCached(request.chain);
    sendResponse({ cached });
  } else if (request.action === 'setCache') {
    setCache(request.chain, request.results);
    sendResponse({ success: true });
  }
  return true;
});

/**
 * Schedule periodic health checks (optional)
 */
chrome.alarms?.create('healthCheck', { periodInMinutes: 10 });

chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'healthCheck') {
    // Could run background health checks here
    console.log('RPC Optimizer: Background health check');
  }
});

console.log('RPC Optimizer: Background service worker started');

