/**
 * RPC Optimizer
 * Multi-platform RPC benchmarking tool for crypto wallets
 * Find the fastest and most reliable RPC endpoints
 */

// Main classes and factory functions
export { RpcOptimizer, createOptimizer } from './core/optimizer';

// Core functionality
export { checkHealth, checkHealthBatch } from './core/health-check';
export { benchmarkEndpoint, benchmarkEndpoints } from './core/benchmark';
export { recommendBestRpc, recommendAllChains, formatRecommendation } from './core/recommender';

// Chain data (static)
export {
  PUBLIC_RPC_ENDPOINTS,
  getEndpointsByChain,
  getSupportedChains,
  CHAIN_IDS
} from './chains/endpoints';

// Chain data (dynamic - fetches from ChainList)
export {
  fetchRpcsByChain,
  fetchRpcsByChainId,
  fetchAllRpcs,
  fetchChainList,
  clearChainListCache,
} from './chains/chainlist-fetcher';

// Wallet integration
export {
  hasInjectedWallet,
  getWalletProvider,
  connectWallet,
  addNetworkToWallet,
  generateNetworkConfig,
  generateTrustWalletLink,
  generateRainbowLink,
  copyToClipboard,
  applyToWallet,
} from './wallet/integration';

// Types
export type {
  ChainType,
  RpcEndpoint,
  HealthCheckResult,
  BenchmarkResult,
  BenchmarkOptions,
  RpcRecommendation,
  OptimizerConfig,
} from './types';

/**
 * Quick start example:
 * 
 * ```typescript
 * import { createOptimizer } from 'rpc-optimizer';
 * 
 * const optimizer = createOptimizer();
 * 
 * // Get the best RPC for Ethereum
 * const recommendation = await optimizer.getBestRpc('ethereum');
 * console.log(recommendation.recommended.endpoint.url);
 * 
 * // Quick find fastest
 * const fastest = await optimizer.findFastest('polygon');
 * console.log(fastest.url);
 * ```
 */

