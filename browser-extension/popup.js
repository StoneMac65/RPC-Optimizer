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

// Chain IDs for wallet integration
const CHAIN_IDS = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  arbitrum: 42161,
  optimism: 10,
  avalanche: 43114,
  base: 8453,
  solana: 0,
};

const CHAIN_METADATA = {
  ethereum: { name: 'Ethereum', symbol: 'ETH', decimals: 18, explorer: 'https://etherscan.io' },
  polygon: { name: 'Polygon', symbol: 'MATIC', decimals: 18, explorer: 'https://polygonscan.com' },
  bsc: { name: 'BNB Smart Chain', symbol: 'BNB', decimals: 18, explorer: 'https://bscscan.com' },
  arbitrum: { name: 'Arbitrum One', symbol: 'ETH', decimals: 18, explorer: 'https://arbiscan.io' },
  optimism: { name: 'Optimism', symbol: 'ETH', decimals: 18, explorer: 'https://optimistic.etherscan.io' },
  avalanche: { name: 'Avalanche C-Chain', symbol: 'AVAX', decimals: 18, explorer: 'https://snowtrace.io' },
  base: { name: 'Base', symbol: 'ETH', decimals: 18, explorer: 'https://basescan.org' },
};

// Current best RPC (stored for wallet integration)
let currentBestRpc = null;
let currentChain = null;

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
const applyToWalletBtn = document.getElementById('applyToWalletBtn');
const copyRpcBtn = document.getElementById('copyRpcBtn');

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
function displayResults(results, chain) {
  if (results.length === 0) {
    showError('No healthy RPC endpoints found');
    return;
  }

  const best = results[0];
  const alts = results.slice(1, 4);

  // Store for wallet integration
  currentBestRpc = best;
  currentChain = chain;

  bestRpcDiv.innerHTML = `
    <div class="provider">${best.name}</div>
    <div class="url">${best.url}</div>
    <div class="stats">
      <div>Latency: <span>${Math.round(best.latency)}ms</span></div>
      <div>Block: <span>${best.blockHeight?.toLocaleString() || 'N/A'}</span></div>
    </div>
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

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Add network to wallet using wallet_addEthereumChain
 */
async function addToWallet(rpc, chain) {
  if (chain === 'solana') {
    showToast('Solana not supported for MetaMask', 'error');
    return;
  }

  if (typeof window.ethereum === 'undefined') {
    showToast('No wallet detected. Install MetaMask!', 'error');
    return;
  }

  const chainId = CHAIN_IDS[chain];
  const meta = CHAIN_METADATA[chain];
  const chainIdHex = '0x' + chainId.toString(16);

  try {
    // Try switching first
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    showToast(`Switched to ${meta.name}!`, 'success');
  } catch (switchError) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: `${meta.name} (Optimized)`,
            nativeCurrency: {
              name: meta.symbol,
              symbol: meta.symbol,
              decimals: meta.decimals,
            },
            rpcUrls: [rpc.url],
            blockExplorerUrls: [meta.explorer],
          }],
        });
        showToast(`Added ${meta.name} with optimized RPC!`, 'success');
      } catch (addError) {
        showToast('Failed to add network: ' + addError.message, 'error');
      }
    } else {
      showToast('Failed: ' + switchError.message, 'error');
    }
  }
}

// Event Listeners
checkBtn.addEventListener('click', async () => {
  const chain = chainSelect.value;
  showLoading();
  try {
    const results = await runBenchmark(chain);
    displayResults(results, chain);
  } catch (err) {
    showError(err.message);
  }
});

benchmarkBtn.addEventListener('click', async () => {
  const chain = chainSelect.value;
  showLoading();
  try {
    const results = await runBenchmark(chain);
    displayResults(results, chain);
  } catch (err) {
    showError(err.message);
  }
});

applyToWalletBtn.addEventListener('click', () => {
  if (currentBestRpc && currentChain) {
    addToWallet(currentBestRpc, currentChain);
  }
});

copyRpcBtn.addEventListener('click', async () => {
  if (currentBestRpc) {
    await navigator.clipboard.writeText(currentBestRpc.url);
    showToast('RPC URL copied to clipboard!');
  }
});

