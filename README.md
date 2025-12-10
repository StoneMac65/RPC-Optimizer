# ⚡ RPC Optimizer - Complete Documentation

> **Personal Reference Guide**
> A multi-platform RPC benchmarking tool for crypto wallets

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Project Structure](#project-structure)
4. [Core Modules Explained](#core-modules-explained)
5. [Data Flow](#data-flow)
6. [API Reference](#api-reference)
7. [CLI Commands](#cli-commands)
8. [Browser Extension](#browser-extension)
9. [Wallet Integration](#wallet-integration)
10. [Building & Running](#building--running)
11. [Adding New Chains](#adding-new-chains)

---

## Overview

### What This Project Does

This tool helps crypto traders find the **fastest and most reliable RPC endpoints** for their blockchain transactions. Slow RPCs = missed trades. This tool:

1. **Benchmarks** multiple public RPC endpoints
2. **Scores** them based on latency, reliability, and sync status
3. **Recommends** the best one
4. **Applies** it directly to your wallet (MetaMask, etc.)

### Why It Matters

- Public RPCs have varying performance based on your location
- RPCs can become congested or go down
- Using the fastest RPC = faster transaction submissions = better trade execution

### Supported Chains

| Chain | Chain ID | Endpoints | Notes |
|-------|----------|-----------|-------|
| Ethereum | 1 | 8 | Main EVM chain |
| Polygon | 137 | 6 | L2, low fees |
| BSC | 56 | 6 | Binance chain |
| Arbitrum | 42161 | 6 | Ethereum L2 |
| Optimism | 10 | 6 | Ethereum L2 |
| Avalanche | 43114 | 5 | C-Chain |
| Base | 8453 | 6 | Coinbase L2 |
| Solana | N/A | 3 | Non-EVM |

---

## How It Works

### The Benchmarking Process

```
┌─────────────────────────────────────────────────────────────┐
│                    RPC OPTIMIZER FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. GET ENDPOINTS                                            │
│     ├── Static list (endpoints.ts) - 46 curated RPCs        │
│     └── Dynamic fetch (ChainList API) - hundreds more       │
│                                                              │
│  2. HEALTH CHECK (per endpoint)                              │
│     ├── Send JSON-RPC request (eth_blockNumber)             │
│     ├── Measure response time (latency)                     │
│     ├── Check if response is valid                          │
│     └── Record block height                                 │
│                                                              │
│  3. BENCHMARK (multiple samples per endpoint)                │
│     ├── Run 5 health checks per endpoint                    │
│     ├── Calculate: avg, min, max, p95 latency              │
│     ├── Calculate: success rate                             │
│     └── Calculate: block delay (vs highest block)           │
│                                                              │
│  4. SCORING (0-100)                                          │
│     ├── Latency Score (35%) - lower = better                │
│     ├── Reliability Score (35%) - higher = better           │
│     ├── Block Delay Score (20%) - 0 delay = best            │
│     └── Consistency Score (10%) - less variance = better    │
│                                                              │
│  5. RECOMMENDATION                                           │
│     ├── Sort by score                                        │
│     ├── Return best + alternatives                          │
│     └── Generate reason string                              │
│                                                              │
│  6. APPLY TO WALLET                                          │
│     ├── MetaMask: wallet_addEthereumChain API               │
│     ├── Trust Wallet: Deep link                             │
│     └── Others: Copy to clipboard                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Scoring Algorithm Details

```typescript
Score = (Latency × 0.35) + (Reliability × 0.35) + (BlockDelay × 0.20) + (Consistency × 0.10)

Where:
- Latency Score = max(0, 100 - (avgLatencyMs / 5))
  → 0ms = 100 points, 500ms = 0 points

- Reliability Score = successRate × 100
  → 100% success = 100 points

- Block Delay Score = max(0, 100 - (blocksDelayed × 10))
  → 0 blocks behind = 100 points, 10+ blocks = 0 points

- Consistency Score = max(0, 100 - (maxLatency - minLatency) / 5)
  → Lower variance = higher score
```

---

## Project Structure

```
rpc-optimizer/
│
├── src/                          # Source code (TypeScript)
│   │
│   ├── index.ts                  # Main library exports
│   │                             # - Re-exports all public APIs
│   │                             # - Entry point for npm package
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   │                             # - ChainType (union of chain names)
│   │                             # - RpcEndpoint (url, name, chain, etc.)
│   │                             # - HealthCheckResult
│   │                             # - BenchmarkResult
│   │                             # - RpcRecommendation
│   │                             # - OptimizerConfig
│   │
│   ├── chains/
│   │   ├── endpoints.ts          # Static RPC database
│   │   │                         # - PUBLIC_RPC_ENDPOINTS array
│   │   │                         # - CHAIN_IDS mapping
│   │   │                         # - getEndpointsByChain()
│   │   │                         # - getSupportedChains()
│   │   │
│   │   ├── chainlist-fetcher.ts  # Dynamic RPC fetching
│   │   │                         # - fetchChainList() - gets all chains
│   │   │                         # - fetchRpcsByChain() - filters by chain
│   │   │                         # - fetchAllRpcs() - all supported chains
│   │   │                         # - Caches for 30 minutes
│   │   │
│   │   └── defillama-fetcher.ts  # DefiLlama/LlamaNodes endpoints
│   │                             # - LLAMA_RPC_ENDPOINTS array (44+ RPCs)
│   │                             # - getDefiLlamaEndpoints()
│   │                             # - getDefiLlamaEndpointsByChain()
│   │                             # - PREMIUM_PROVIDERS list
│   │
│   ├── core/
│   │   ├── health-check.ts       # Single endpoint health check
│   │   │                         # - checkHealth() - ping one RPC
│   │   │                         # - checkHealthBatch() - ping many in parallel
│   │   │                         # - Handles EVM + Solana differently
│   │   │
│   │   ├── benchmark.ts          # Performance benchmarking
│   │   │                         # - benchmarkEndpoint() - multiple samples
│   │   │                         # - benchmarkEndpoints() - batch benchmark
│   │   │                         # - calculateScore() - scoring algorithm
│   │   │
│   │   ├── recommender.ts        # Recommendation engine
│   │   │                         # - recommendBestRpc() - best for chain
│   │   │                         # - recommendAllChains() - best for all
│   │   │                         # - generateReason() - human-readable reason
│   │   │
│   │   └── optimizer.ts          # Main class (RpcOptimizer)
│   │                             # - Combines all core modules
│   │                             # - Handles caching
│   │                             # - Supports dynamic + static endpoints
│   │
│   ├── wallet/
│   │   └── integration.ts        # Wallet integration
│   │                             # - addNetworkToWallet() - MetaMask API
│   │                             # - generateNetworkConfig() - JSON export
│   │                             # - generateTrustWalletLink() - deep link
│   │                             # - applyToWallet() - all-in-one
│   │
│   └── cli/
│       └── index.ts              # CLI interface
│                                 # - Uses commander.js
│                                 # - Commands: chains, check, benchmark, best, etc.
│
├── browser-extension/            # Chrome extension
│   ├── manifest.json             # Extension config (Manifest V3)
│   ├── popup.html                # Extension popup UI
│   ├── popup.css                 # Styles
│   ├── popup.js                  # Popup logic + wallet integration
│   └── background.js             # Service worker (caching)
│
├── package.json                  # npm package config
├── tsconfig.json                 # TypeScript config
├── tsup.config.ts                # Build config (outputs CJS + ESM)
├── .gitignore
└── LICENSE
```

---

## Core Modules Explained

### 1. Types (`src/types/index.ts`)

```typescript
// Chain identifier - union type of all supported chains
type ChainType = 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism' | 'avalanche' | 'base' | 'solana';

// RPC endpoint definition
interface RpcEndpoint {
  url: string;        // "https://eth.llamarpc.com"
  name: string;       // "LlamaRPC"
  chain: ChainType;   // "ethereum"
  isPublic: boolean;  // true
  provider?: string;  // "LlamaNodes"
}

// Result of a health check
interface HealthCheckResult {
  endpoint: RpcEndpoint;
  isHealthy: boolean;
  latencyMs: number;
  blockHeight: number | null;
  timestamp: number;
  error?: string;
}

// Result of a full benchmark
interface BenchmarkResult {
  endpoint: RpcEndpoint;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
  successRate: number;     // 0-1
  blockHeight: number | null;
  blockDelay: number;      // blocks behind highest
  score: number;           // 0-100
  timestamp: number;
  sampleCount: number;
}

// Final recommendation
interface RpcRecommendation {
  recommended: BenchmarkResult;
  alternatives: BenchmarkResult[];
  chain: ChainType;
  reason: string;          // "Top performer, 100% reliability, excellent latency"
  timestamp: number;
}
```

### 2. Health Check (`src/core/health-check.ts`)

**Purpose**: Ping a single RPC and measure response time.

**How it works**:
```typescript
// For EVM chains (Ethereum, Polygon, etc.)
const payload = {
  jsonrpc: '2.0',
  method: 'eth_blockNumber',  // Returns current block as hex
  params: [],
  id: 1,
};

// For Solana
const payload = {
  jsonrpc: '2.0',
  method: 'getSlot',          // Returns current slot number
  params: [],
  id: 1,
};
```

**Key functions**:
- `checkHealth(endpoint, timeout)` - Check single endpoint
- `checkHealthBatch(endpoints, timeout)` - Check many in parallel

### 3. Benchmark (`src/core/benchmark.ts`)

**Purpose**: Run multiple health checks and calculate statistics.

**Process**:
1. Run N health checks (default: 5)
2. Calculate average, min, max, p95 latency
3. Calculate success rate
4. Calculate score using weighted formula

**Key functions**:
- `benchmarkEndpoint(endpoint, options)` - Benchmark single endpoint
- `benchmarkEndpoints(endpoints, options)` - Benchmark all, calculate block delays

### 4. Recommender (`src/core/recommender.ts`)

**Purpose**: Pick the best RPC and explain why.

**Logic**:
1. Filter out failed endpoints (successRate = 0)
2. Sort by score (highest first)
3. Take top 1 as recommended, next 3 as alternatives
4. Generate human-readable reason

### 5. Optimizer (`src/core/optimizer.ts`)

**Purpose**: Main class that ties everything together.

```typescript
class RpcOptimizer {
  // Configuration
  private config: OptimizerConfig;
  private cache: Map<string, { result: BenchmarkResult[]; timestamp: number }>;
  private endpoints: RpcEndpoint[];  // Static endpoints
  private dynamicEndpoints: Map<ChainType, RpcEndpoint[]>;  // From ChainList

  // Methods
  getEndpoints(chain?): RpcEndpoint[]           // Get all endpoints
  getSupportedChains(): ChainType[]             // Get chain list
  addEndpoint(endpoint): void                   // Add custom RPC

  checkEndpoint(endpoint, timeout): Promise<HealthCheckResult>
  checkChain(chain, timeout): Promise<HealthCheckResult[]>

  benchmarkChain(chain, options): Promise<BenchmarkResult[]>
  benchmarkAll(options): Promise<BenchmarkResult[]>

  getBestRpc(chain, options): Promise<RpcRecommendation | null>
  getAllRecommendations(options): Promise<Map<ChainType, RpcRecommendation>>

  findFastest(chain, timeout): Promise<RpcEndpoint | null>  // Quick check

  // Dynamic fetching
  setDynamicFetch(enabled): void
  refreshEndpoints(chain): Promise<RpcEndpoint[]>
  refreshAllEndpoints(): Promise<RpcEndpoint[]>

  clearCache(): void
}
```

### 6. ChainList Fetcher (`src/chains/chainlist-fetcher.ts`)

**Purpose**: Fetch fresh RPC endpoints from ChainList API.

**Data source**: `https://chainid.network/chains.json`

**Features**:
- Caches results for 30 minutes
- Filters out RPCs requiring API keys
- Filters out non-HTTPS endpoints
- Extracts provider name from URL

### 7. DefiLlama Fetcher (`src/chains/defillama-fetcher.ts`)

**Purpose**: Provide curated, high-quality RPC endpoints from DefiLlama/LlamaNodes ecosystem.

**Source**: [llamarpc.com](https://llamarpc.com) - Privacy-first RPC by DefiLlama team

**Included Providers**:
| Provider | Description | Website |
|----------|-------------|---------|
| **LlamaNodes** | Privacy-first, part of DefiLlama | [llamarpc.com](https://llamarpc.com) |
| **dRPC** | Decentralized RPC network | [drpc.org](https://drpc.org) |
| **PublicNode** | Fast, free, privacy-focused | [publicnode.com](https://publicnode.com) |
| **Ankr** | Multi-chain infrastructure | [ankr.com](https://ankr.com) |
| **1RPC** | Privacy-preserving RPC relay | [1rpc.io](https://1rpc.io) |
| **BlastAPI** | High-performance endpoints | [blastapi.io](https://blastapi.io) |

**Usage**:
```typescript
import {
  getDefiLlamaEndpoints,
  getDefiLlamaEndpointsByChain,
  LLAMA_RPC_ENDPOINTS,
  PREMIUM_PROVIDERS
} from 'rpc-optimizer';

// Get all DefiLlama endpoints
const all = getDefiLlamaEndpoints();

// Get endpoints for a specific chain
const ethEndpoints = getDefiLlamaEndpointsByChain('ethereum');

// Direct access to endpoints array
console.log(LLAMA_RPC_ENDPOINTS.length); // 44+ endpoints
```

**CLI Command**:
```bash
# List all DefiLlama endpoints
rpc-optimizer defillama

# List endpoints for a specific chain
rpc-optimizer defillama ethereum
```

### 8. Wallet Integration (`src/wallet/integration.ts`)

**Purpose**: Apply recommended RPC to user's wallet.

**Methods**:

| Function | What it does |
|----------|--------------|
| `hasInjectedWallet()` | Check if MetaMask/wallet exists |
| `connectWallet()` | Request account access |
| `addNetworkToWallet(endpoint)` | Add/switch network in MetaMask |
| `generateNetworkConfig(endpoint)` | Generate JSON for manual import |
| `generateTrustWalletLink(endpoint)` | Create `trust://` deep link |
| `copyToClipboard(text)` | Copy URL to clipboard |
| `applyToWallet(endpoint)` | All-in-one (tries wallet, falls back to clipboard) |

**MetaMask Integration Flow**:
```
1. Try wallet_switchEthereumChain (if chain exists)
   └── Success? Done!
   └── Error 4902? Chain not added
       └── Call wallet_addEthereumChain with:
           - chainId (hex)
           - chainName
           - nativeCurrency
           - rpcUrls (our optimized RPC)
           - blockExplorerUrls
```

---

## Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                               │
└──────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   User Input    │
                              │  (chain name)   │
                              └────────┬────────┘
                                       │
                                       ▼
              ┌─────────────────────────────────────────────────────────┐
              │              RpcOptimizer                                 │
              │                                                           │
              │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
              │  │   Static    │ +│  DefiLlama  │ +│  Dynamic Fetch   │  │
              │  │  Endpoints  │  │  Endpoints  │  │  (ChainList API) │  │
              │  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘  │
              │         │                │                  │            │
              │         └────────────────┼──────────────────┘            │
              │                          │                               │
              │                          ▼                               │
              │                 ┌───────────────┐                        │
              │                 │  Deduplicate  │                        │
              │                 │  + Filter by  │                        │
              │                 │    chain      │                        │
              │                 └───────┬───────┘                        │
              │                         │                                │
              └─────────────────────────┼────────────────────────────────┘
                                │
                                ▼
              ┌─────────────────────────────────────────────┐
              │              Health Check                    │
              │                                              │
              │   For each endpoint:                         │
              │   ┌──────────────────────────────────────┐  │
              │   │  POST /rpc                            │  │
              │   │  { method: "eth_blockNumber" }        │  │
              │   │                                       │  │
              │   │  Measure: latency, blockHeight        │  │
              │   │  Record: success/failure              │  │
              │   └──────────────────────────────────────┘  │
              └───────────────────┬─────────────────────────┘
                                  │
                                  ▼
              ┌─────────────────────────────────────────────┐
              │              Benchmark                       │
              │                                              │
              │   Run 5 samples per endpoint                 │
              │   Calculate:                                 │
              │   - avgLatencyMs, minLatencyMs, maxLatencyMs │
              │   - p95LatencyMs                             │
              │   - successRate                              │
              │   - blockDelay (vs max block)                │
              │   - score (0-100)                            │
              └───────────────────┬─────────────────────────┘
                                  │
                                  ▼
              ┌─────────────────────────────────────────────┐
              │              Recommender                     │
              │                                              │
              │   Sort by score (descending)                 │
              │   Pick #1 as recommended                     │
              │   Pick #2-4 as alternatives                  │
              │   Generate reason string                     │
              └───────────────────┬─────────────────────────┘
                                  │
                                  ▼
              ┌─────────────────────────────────────────────┐
              │              Output                          │
              │                                              │
              │   ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
              │   │   CLI   │ │ Library │ │  Extension  │   │
              │   │ Output  │ │  Return │ │   Popup     │   │
              │   └────┬────┘ └────┬────┘ └──────┬──────┘   │
              │        │           │             │          │
              └────────┼───────────┼─────────────┼──────────┘
                       │           │             │
                       ▼           ▼             ▼
              ┌─────────────────────────────────────────────┐
              │           Wallet Integration                 │
              │                                              │
              │   ┌──────────┐  ┌──────────┐  ┌──────────┐  │
              │   │ MetaMask │  │  Trust   │  │ Clipboard│  │
              │   │   API    │  │ DeepLink │  │   Copy   │  │
              │   └──────────┘  └──────────┘  └──────────┘  │
              └─────────────────────────────────────────────┘
```

---

## API Reference

### Library Usage (npm package)

```typescript
import {
  createOptimizer,
  RpcOptimizer,
  checkHealth,
  benchmarkEndpoints,
  fetchRpcsByChain,
  addNetworkToWallet,
  PUBLIC_RPC_ENDPOINTS,
} from 'rpc-optimizer';

// ============================================
// BASIC USAGE
// ============================================

// Create optimizer instance
const optimizer = createOptimizer();

// Get best RPC for a chain
const recommendation = await optimizer.getBestRpc('ethereum');
console.log(recommendation.recommended.endpoint.url);
// "https://eth.llamarpc.com"

// Quick find fastest (less accurate, but fast)
const fastest = await optimizer.findFastest('polygon');
console.log(fastest.url);

// ============================================
// BENCHMARKING
// ============================================

// Full benchmark with custom options
const results = await optimizer.benchmarkChain('arbitrum', {
  samples: 10,        // More samples = more accurate
  timeout: 3000,      // 3 second timeout
  parallel: true,     // Run in parallel (faster)
});

// Sort by score
results.sort((a, b) => b.score - a.score);

// Display results
results.forEach(r => {
  console.log(`${r.endpoint.name}: ${r.score}/100 (${r.avgLatencyMs}ms)`);
});

// ============================================
// DYNAMIC RPC FETCHING
// ============================================

// Enable dynamic fetching from ChainList
const optimizer2 = createOptimizer({ useDynamicFetch: true });

// Refresh endpoints from ChainList
await optimizer2.refreshEndpoints('ethereum');
// Now includes hundreds of RPCs from ChainList

// Benchmark with fresh RPCs
const results2 = await optimizer2.benchmarkChain('ethereum');

// ============================================
// CUSTOM ENDPOINTS
// ============================================

const optimizer3 = createOptimizer({
  customEndpoints: [
    {
      url: 'https://my-private-rpc.com',
      name: 'MyPrivateRPC',
      chain: 'ethereum',
      isPublic: false,
      provider: 'Self-hosted',
    },
  ],
});

// ============================================
// WALLET INTEGRATION (Browser only)
// ============================================

import { addNetworkToWallet, applyToWallet } from 'rpc-optimizer';

// Add to MetaMask directly
const rec = await optimizer.getBestRpc('polygon');
await addNetworkToWallet(rec.recommended.endpoint);
// User sees MetaMask popup to add/switch network

// All-in-one (tries wallet, falls back to clipboard)
const result = await applyToWallet(rec.recommended.endpoint);
console.log(result.message);
// "Successfully added LlamaRPC RPC to your wallet!"

// ============================================
// LOW-LEVEL ACCESS
// ============================================

import { checkHealth, benchmarkEndpoint } from 'rpc-optimizer';

// Check single endpoint
const health = await checkHealth({
  url: 'https://eth.llamarpc.com',
  name: 'LlamaRPC',
  chain: 'ethereum',
  isPublic: true,
}, 5000);

console.log(health.isHealthy);    // true
console.log(health.latencyMs);    // 45.23
console.log(health.blockHeight);  // 18654321
```

---

## CLI Commands

### Installation
```bash
# After building
npm link

# Or install globally
npm install -g rpc-optimizer
```

### Commands Reference

#### `rpc-optimizer chains`
List all supported blockchain networks.

```
$ rpc-optimizer chains

Supported Chains:

  • ethereum
  • polygon
  • bsc
  • arbitrum
  • optimism
  • avalanche
  • base
  • solana
```

#### `rpc-optimizer check <chain>`
Quick health check for all RPCs on a chain.

```
$ rpc-optimizer check ethereum

ETHEREUM RPC Health Check:

┌──────────────────┬────────────┬───────────────┬───────────────┐
│ Provider         │ Status     │ Latency       │ Block Height  │
├──────────────────┼────────────┼───────────────┼───────────────┤
│ LlamaRPC         │ ✓ OK       │ 42ms          │ 18,654,321    │
│ Ankr             │ ✓ OK       │ 68ms          │ 18,654,321    │
│ PublicNode       │ ✓ OK       │ 89ms          │ 18,654,320    │
│ Cloudflare       │ ✗ Fail     │ -             │ -             │
└──────────────────┴────────────┴───────────────┴───────────────┘
```

Options:
- `-t, --timeout <ms>` - Timeout per request (default: 5000)

#### `rpc-optimizer benchmark <chain>`
Full benchmark with scoring.

```
$ rpc-optimizer benchmark polygon --samples 10

POLYGON RPC Benchmark Results:

┌──────────────────┬──────────┬────────────┬────────────┬────────────┬──────────────┐
│ Provider         │ Score    │ Avg        │ P95        │ Success    │ Block Delay  │
├──────────────────┼──────────┼────────────┼────────────┼────────────┼──────────────┤
│ LlamaRPC         │ 95/100   │ 32ms       │ 45ms       │ 100%       │ 0            │
│ Ankr             │ 88/100   │ 56ms       │ 78ms       │ 100%       │ 0            │
│ PublicNode       │ 82/100   │ 89ms       │ 120ms      │ 90%        │ 1            │
└──────────────────┴──────────┴────────────┴────────────┴────────────┴──────────────┘
```

Options:
- `-s, --samples <n>` - Samples per endpoint (default: 5)
- `-t, --timeout <ms>` - Timeout per request (default: 5000)
- `--json` - Output as JSON

#### `rpc-optimizer best <chain>`
Get the recommended RPC.

```
$ rpc-optimizer best ethereum

🏆 Best RPC for ETHEREUM:

  URL: https://eth.llamarpc.com
  Provider: LlamaRPC (LlamaNodes)
  Score: 95/100
  Latency: 42ms avg, 58ms p95
  Reliability: 100%
  Reason: Top performer, 100% reliability, excellent latency
```

Options:
- `--json` - Output as JSON

#### `rpc-optimizer fetch <chain>`
Fetch RPCs from ChainList.

```
$ rpc-optimizer fetch arbitrum

📡 Found 24 RPCs for ARBITRUM from ChainList:

  1. https://arb1.arbitrum.io/rpc
     Provider: Arbitrum
  2. https://rpc.ankr.com/arbitrum
     Provider: Ankr
  ...
```

#### `rpc-optimizer benchmark-live <chain>`
Benchmark with fresh RPCs from ChainList.

```
$ rpc-optimizer benchmark-live base --samples 3
```

#### `rpc-optimizer wallet-config <chain>`
Generate wallet configuration.

```
$ rpc-optimizer wallet-config ethereum

🔧 Wallet Config for ETHEREUM:

Network Config (JSON):
{
  "chainId": 1,
  "chainIdHex": "0x1",
  "chainName": "Ethereum (Optimized RPC)",
  "rpcUrl": "https://eth.llamarpc.com",
  "nativeCurrency": {
    "name": "ETH",
    "symbol": "ETH",
    "decimals": 18
  },
  "blockExplorerUrl": "https://etherscan.io",
  "provider": "LlamaNodes"
}

Trust Wallet Deep Link:
trust://add_network?chain_id=1&rpc_url=https%3A%2F%2Feth.llamarpc.com

📝 Manual Setup Instructions:
  1. Open your wallet settings
  2. Navigate to "Networks" or "RPC Settings"
  3. Find ETHEREUM or add custom network
  4. Replace RPC URL with: https://eth.llamarpc.com
  5. Save and restart wallet

💡 For MetaMask: Use our browser extension for one-click setup!
```

---

## Browser Extension

### Installation

1. Build the project (or use pre-built)
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `browser-extension` folder

### Features

| Feature | Description |
|---------|-------------|
| **Chain Selector** | Choose from 8 supported chains |
| **Quick Check** | Fast health check of all RPCs |
| **Full Benchmark** | Detailed benchmark with scores |
| **Apply to Wallet** | One-click add to MetaMask |
| **Copy URL** | Copy RPC URL to clipboard |

### How "Apply to Wallet" Works

```javascript
// 1. Check if wallet exists
if (typeof window.ethereum === 'undefined') {
  showError('Install MetaMask!');
  return;
}

// 2. Get chain info
const chainId = CHAIN_IDS[chain];  // e.g., 1 for Ethereum
const chainIdHex = '0x' + chainId.toString(16);  // "0x1"

// 3. Try to switch to chain
try {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: chainIdHex }],
  });
} catch (error) {
  // 4. If chain not added (error 4902), add it
  if (error.code === 4902) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: chainIdHex,
        chainName: 'Ethereum (Optimized)',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://eth.llamarpc.com'],
        blockExplorerUrls: ['https://etherscan.io'],
      }],
    });
  }
}
```

### Extension Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome extension config (Manifest V3) |
| `popup.html` | UI structure |
| `popup.css` | Styling (dark theme) |
| `popup.js` | Logic, wallet integration, API calls |
| `background.js` | Service worker (caching, alarms) |

---

## Wallet Integration

### Supported Wallets

| Wallet | Integration Method | Notes |
|--------|-------------------|-------|
| MetaMask | `wallet_addEthereumChain` | Full support |
| Coinbase Wallet | Same API | Works in browser |
| Trust Wallet | Deep link `trust://` | Mobile only |
| Rainbow | Deep link `rainbow://` | Mobile only |
| Others | Copy to clipboard | Manual paste |

### Integration Code Examples

#### MetaMask (Browser)
```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x89',  // Polygon = 137 = 0x89
    chainName: 'Polygon (Optimized)',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon.llamarpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  }],
});
```

#### Trust Wallet (Mobile Deep Link)
```
trust://add_network?chain_id=137&rpc_url=https%3A%2F%2Fpolygon.llamarpc.com
```

#### Manual (Any Wallet)
1. Go to wallet settings
2. Find "Networks" or "RPC"
3. Edit existing or add custom
4. Paste the optimized RPC URL

---

## Building & Running

### Prerequisites

- Node.js 18+
- npm or yarn

### Build Steps

```bash
# 1. Install dependencies
npm install

# 2. Build library (outputs to dist/)
npm run build

# 3. Link CLI globally (optional)
npm link

# 4. Test CLI
rpc-optimizer check ethereum
```

### Development

```bash
# Watch mode (rebuild on changes)
npm run dev

# Type checking
npm run typecheck

# Build CLI only
npx tsup src/cli/index.ts --format cjs --out-dir dist
```

### Build Output

```
dist/
├── index.js         # CommonJS build
├── index.mjs        # ESM build
├── index.d.ts       # TypeScript declarations
├── cli.js           # CLI entry point
└── cli.d.ts
```

---

## Adding New Chains

### Step 1: Add to Types (`src/types/index.ts`)

```typescript
export type ChainType =
  | 'ethereum'
  | 'polygon'
  // ... existing chains
  | 'newchain';  // Add new chain
```

### Step 2: Add Endpoints (`src/chains/endpoints.ts`)

```typescript
// Add to PUBLIC_RPC_ENDPOINTS array
{ url: 'https://rpc.newchain.io', name: 'Official', chain: 'newchain', isPublic: true, provider: 'NewChain' },
{ url: 'https://rpc.ankr.com/newchain', name: 'Ankr', chain: 'newchain', isPublic: true, provider: 'Ankr' },

// Add to CHAIN_IDS (if EVM)
export const CHAIN_IDS: Record<...> = {
  // ...existing
  newchain: 12345,  // The chain ID
};
```

### Step 3: Add Wallet Metadata (`src/wallet/integration.ts`)

```typescript
const CHAIN_METADATA = {
  // ...existing
  newchain: {
    name: 'New Chain',
    symbol: 'NEW',
    decimals: 18,
    explorer: 'https://explorer.newchain.io'
  },
};
```

### Step 4: Update Browser Extension (`browser-extension/popup.js`)

Add to `CHAIN_ENDPOINTS` object:
```javascript
newchain: [
  { url: 'https://rpc.newchain.io', name: 'Official' },
  { url: 'https://rpc.ankr.com/newchain', name: 'Ankr' },
],
```

Add to `CHAIN_IDS` and `CHAIN_METADATA` in popup.js.

### Step 5: Update popup.html

Add option to select:
```html
<option value="newchain">New Chain</option>
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No wallet detected" | MetaMask not installed | Install MetaMask extension |
| RPC timeout | Endpoint down or slow | Increase timeout, try different chain |
| CORS errors | Running in browser | Use extension or proxy |
| Empty benchmark results | All RPCs failed | Check internet, reduce timeout |
| "Chain not supported" | Solana + MetaMask | Solana not supported for EVM wallets |

### Debug Mode

```typescript
// Enable verbose logging
const optimizer = createOptimizer({
  debug: true,  // (not implemented yet)
});
```

---

## Notes & Tips

### Performance Tips

1. **Use caching**: Results cached for 5 minutes by default
2. **Parallel benchmarks**: Set `parallel: true` (default)
3. **Lower samples for quick checks**: `samples: 3` is usually enough
4. **Use `findFastest()` for speed**: Single request per endpoint

### Security Considerations

1. Only use public RPCs for read operations
2. For transactions, consider private RPCs (Infura, Alchemy)
3. Public RPCs may log your requests
4. Some RPCs have rate limits

### RPC Quality Factors

| Factor | Impact | How We Measure |
|--------|--------|----------------|
| Latency | Trade speed | Response time in ms |
| Reliability | Uptime | Success rate % |
| Block Height | Data freshness | Blocks behind leader |
| Rate Limits | Sustainability | Not measured (TODO) |

---

## Future Improvements

- [ ] Rate limit detection
- [ ] WebSocket support
- [ ] Geographic-based recommendations
- [ ] Private RPC integration (Infura, Alchemy)
- [ ] Auto-refresh in background
- [ ] Notifications when better RPC found
- [ ] Support for more chains (Fantom, zkSync, etc.)
- [ ] Mobile app (React Native)

---

## Resources

### RPC Data Sources
- [ChainList](https://chainlist.org) - Community RPC directory
- [LlamaRPC](https://llamarpc.com) - DefiLlama's privacy-first RPC
- [dRPC](https://drpc.org) - Decentralized RPC network
- [PublicNode](https://publicnode.com) - Fast, free endpoints
- [1RPC](https://1rpc.io) - Privacy-preserving relay
- [Ankr](https://rpc.ankr.com) - Multi-chain infrastructure

### Technical References
- [chainid.network](https://chainid.network) - Chain data API
- [MetaMask Docs](https://docs.metamask.io) - Wallet integration
- [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085) - wallet_addEthereumChain spec

---

*Last updated: December 2024*

