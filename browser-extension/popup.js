/**
 * RPC Optimizer Browser Extension - Popup Script
 */

// Chain configurations
const CHAIN_ENDPOINTS = {
  ethereum: [
    { url: 'https://eth.llamarpc.com', name: 'LlamaRPC' },
    { url: 'https://rpc.ankr.com/eth', name: 'Ankr' },
    { url: 'https://ethereum.publicnode.com', name: 'PublicNode' },
    { url: 'https://1rpc.io/eth', name: '1RPC' },
    { url: 'https://eth.drpc.org', name: 'dRPC' },
    { url: 'https://cloudflare-eth.com', name: 'Cloudflare' },
  ],
  polygon: [
    { url: 'https://polygon.llamarpc.com', name: 'LlamaRPC' },
    { url: 'https://rpc.ankr.com/polygon', name: 'Ankr' },
    { url: 'https://polygon-bor-rpc.publicnode.com', name: 'PublicNode' },
    { url: 'https://1rpc.io/matic', name: '1RPC' },
    { url: 'https://polygon.drpc.org', name: 'dRPC' },
  ],
  bsc: [
    { url: 'https://bsc-dataseed1.binance.org', name: 'Binance' },
    { url: 'https://rpc.ankr.com/bsc', name: 'Ankr' },
    { url: 'https://bsc.publicnode.com', name: 'PublicNode' },
    { url: 'https://1rpc.io/bnb', name: '1RPC' },
  ],
  arbitrum: [
    { url: 'https://arb1.arbitrum.io/rpc', name: 'Arbitrum' },
    { url: 'https://rpc.ankr.com/arbitrum', name: 'Ankr' },
    { url: 'https://arbitrum.publicnode.com', name: 'PublicNode' },
    { url: 'https://1rpc.io/arb', name: '1RPC' },
  ],
  optimism: [
    { url: 'https://mainnet.optimism.io', name: 'Optimism' },
    { url: 'https://rpc.ankr.com/optimism', name: 'Ankr' },
    { url: 'https://optimism.publicnode.com', name: 'PublicNode' },
    { url: 'https://1rpc.io/op', name: '1RPC' },
  ],
  avalanche: [
    { url: 'https://api.avax.network/ext/bc/C/rpc', name: 'Avalanche' },
    { url: 'https://rpc.ankr.com/avalanche', name: 'Ankr' },
    { url: 'https://avalanche-c-chain-rpc.publicnode.com', name: 'PublicNode' },
  ],
  base: [
    { url: 'https://mainnet.base.org', name: 'Base' },
    { url: 'https://rpc.ankr.com/base', name: 'Ankr' },
    { url: 'https://base.publicnode.com', name: 'PublicNode' },
    { url: 'https://1rpc.io/base', name: '1RPC' },
  ],
  solana: [
    { url: 'https://api.mainnet-beta.solana.com', name: 'Solana' },
    { url: 'https://rpc.ankr.com/solana', name: 'Ankr' },
    { url: 'https://solana.publicnode.com', name: 'PublicNode' },
  ],
};

// DOM Elements
const chainSelect = document.getElementById('chain');
const checkBtn = document.getElementById('checkBtn');
const benchmarkBtn = document.getElementById('benchmarkBtn');
const loadingDiv = document.getElementById('loading');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const bestRpcDiv = document.getElementById('bestRpc');
const alternativesDiv = document.getElementById('alternatives');
const errorMessage = document.getElementById('errorMessage');

/**
 * Check single RPC endpoint
 */
async function checkEndpoint(endpoint, chain) {
  const isSolana = chain === 'solana';
  const payload = isSolana
    ? { jsonrpc: '2.0', method: 'getSlot', params: [], id: 1 }
    : { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 };

  const start = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = performance.now() - start;

    if (!response.ok) {
      return { ...endpoint, latency, success: false, error: 'HTTP Error' };
    }

    const data = await response.json();
    if (data.error) {
      return { ...endpoint, latency, success: false, error: data.error.message };
    }

    const blockHeight = isSolana ? data.result : parseInt(data.result, 16);
    return { ...endpoint, latency, success: true, blockHeight };
  } catch (err) {
    return { ...endpoint, latency: 5000, success: false, error: err.message };
  }
}

/**
 * Run benchmark for selected chain
 */
async function runBenchmark(chain) {
  const endpoints = CHAIN_ENDPOINTS[chain];
  if (!endpoints) {
    throw new Error(`Unknown chain: ${chain}`);
  }

  const results = await Promise.all(
    endpoints.map(ep => checkEndpoint(ep, chain))
  );

  // Sort by latency (fastest first)
  return results
    .filter(r => r.success)
    .sort((a, b) => a.latency - b.latency);
}

/**
 * Display results
 */
function displayResults(results) {
  if (results.length === 0) {
    showError('No healthy RPC endpoints found');
    return;
  }

  const best = results[0];
  const alts = results.slice(1, 4);

  bestRpcDiv.innerHTML = `
    <div class="provider">${best.name}</div>
    <div class="url">${best.url}</div>
    <div class="stats">
      <div>Latency: <span>${Math.round(best.latency)}ms</span></div>
      <div>Block: <span>${best.blockHeight?.toLocaleString() || 'N/A'}</span></div>
    </div>
    <button class="copy-btn" onclick="navigator.clipboard.writeText('${best.url}')">
      📋 Copy URL
    </button>
  `;

  alternativesDiv.innerHTML = alts.map(alt => `
    <div class="alt-item">
      <span>${alt.name}</span>
      <span class="score">${Math.round(alt.latency)}ms</span>
    </div>
  `).join('');

  loadingDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  resultsDiv.classList.remove('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  loadingDiv.classList.add('hidden');
  resultsDiv.classList.add('hidden');
  errorDiv.classList.remove('hidden');
}

function showLoading() {
  loadingDiv.classList.remove('hidden');
  resultsDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
}

// Event Listeners
checkBtn.addEventListener('click', async () => {
  const chain = chainSelect.value;
  showLoading();
  try {
    const results = await runBenchmark(chain);
    displayResults(results);
  } catch (err) {
    showError(err.message);
  }
});

benchmarkBtn.addEventListener('click', async () => {
  const chain = chainSelect.value;
  showLoading();
  try {
    const results = await runBenchmark(chain);
    displayResults(results);
  } catch (err) {
    showError(err.message);
  }
});

