import {
  RpcEndpoint,
  BenchmarkResult,
  BenchmarkOptions,
  RpcRecommendation,
  OptimizerConfig,
  ChainType,
  HealthCheckResult
} from '../types';
import { PUBLIC_RPC_ENDPOINTS, getEndpointsByChain, getSupportedChains } from '../chains/endpoints';
import { fetchRpcsByChain, fetchAllRpcs, clearChainListCache } from '../chains/chainlist-fetcher';
import { LLAMA_RPC_ENDPOINTS } from '../chains/defillama-fetcher';
import { checkHealth, checkHealthBatch } from './health-check';
import { benchmarkEndpoint, benchmarkEndpoints } from './benchmark';
import { recommendBestRpc, recommendAllChains } from './recommender';

/**
 * Main RPC Optimizer class
 * Provides a unified interface for benchmarking and optimizing RPC endpoints
 */
export class RpcOptimizer {
  private config: OptimizerConfig;
  private cache: Map<string, { result: BenchmarkResult[]; timestamp: number }>;
  private endpoints: RpcEndpoint[];
  private dynamicEndpoints: Map<ChainType, RpcEndpoint[]>;
  private useDynamic: boolean;

  constructor(config: OptimizerConfig = {}) {
    this.config = {
      cacheDuration: 5 * 60 * 1000, // 5 minutes default
      ...config,
    };
    this.cache = new Map();
    this.dynamicEndpoints = new Map();
    this.useDynamic = config.useDynamicFetch ?? false;
    // Combine static endpoints, DefiLlama endpoints, and any custom endpoints
    // Deduplicate by URL
    const allEndpoints = [
      ...PUBLIC_RPC_ENDPOINTS,
      ...LLAMA_RPC_ENDPOINTS,
      ...(config.customEndpoints || []),
    ];
    const seen = new Set<string>();
    this.endpoints = allEndpoints.filter(ep => {
      if (seen.has(ep.url)) return false;
      seen.add(ep.url);
      return true;
    });
  }

  /**
   * Enable or disable dynamic RPC fetching from ChainList
   */
  setDynamicFetch(enabled: boolean): void {
    this.useDynamic = enabled;
    if (!enabled) {
      this.dynamicEndpoints.clear();
    }
  }

  /**
   * Fetch fresh RPCs from ChainList for a chain
   */
  async refreshEndpoints(chain: ChainType): Promise<RpcEndpoint[]> {
    const dynamicRpcs = await fetchRpcsByChain(chain);
    this.dynamicEndpoints.set(chain, dynamicRpcs);
    return dynamicRpcs;
  }

  /**
   * Fetch fresh RPCs for all chains from ChainList
   */
  async refreshAllEndpoints(): Promise<RpcEndpoint[]> {
    const allRpcs = await fetchAllRpcs();
    // Group by chain
    const chains = [...new Set(allRpcs.map(r => r.chain))];
    for (const chain of chains) {
      this.dynamicEndpoints.set(chain, allRpcs.filter(r => r.chain === chain));
    }
    return allRpcs;
  }

  /**
   * Get all available endpoints (static + dynamic)
   */
  getEndpoints(chain?: ChainType): RpcEndpoint[] {
    let endpoints = [...this.endpoints];

    // Add dynamic endpoints if enabled
    if (this.useDynamic) {
      if (chain) {
        const dynamic = this.dynamicEndpoints.get(chain) || [];
        endpoints = [...endpoints, ...dynamic];
      } else {
        for (const [, rpcs] of this.dynamicEndpoints) {
          endpoints = [...endpoints, ...rpcs];
        }
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    endpoints = endpoints.filter(e => {
      if (seen.has(e.url)) return false;
      seen.add(e.url);
      return true;
    });

    if (chain) {
      return endpoints.filter(e => e.chain === chain);
    }
    return endpoints;
  }

  /**
   * Get supported chains
   */
  getSupportedChains(): ChainType[] {
    return getSupportedChains();
  }

  /**
   * Add a custom RPC endpoint
   */
  addEndpoint(endpoint: RpcEndpoint): void {
    this.endpoints.push(endpoint);
  }

  /**
   * Quick health check for a single endpoint
   */
  async checkEndpoint(endpoint: RpcEndpoint, timeout?: number): Promise<HealthCheckResult> {
    return checkHealth(endpoint, timeout);
  }

  /**
   * Quick health check for all endpoints of a chain
   */
  async checkChain(chain: ChainType, timeout?: number): Promise<HealthCheckResult[]> {
    const endpoints = this.getEndpoints(chain);
    return checkHealthBatch(endpoints, timeout);
  }

  /**
   * Full benchmark for a specific chain
   */
  async benchmarkChain(
    chain: ChainType, 
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult[]> {
    const cacheKey = `benchmark_${chain}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < (this.config.cacheDuration || 0)) {
      return cached.result;
    }

    const endpoints = this.getEndpoints(chain);
    const results = await benchmarkEndpoints(endpoints, { ...options, chain });

    this.cache.set(cacheKey, { result: results, timestamp: Date.now() });

    return results;
  }

  /**
   * Benchmark all supported chains
   */
  async benchmarkAll(options: BenchmarkOptions = {}): Promise<BenchmarkResult[]> {
    const chains = this.config.chains || this.getSupportedChains();
    const allResults: BenchmarkResult[] = [];

    for (const chain of chains) {
      const results = await this.benchmarkChain(chain, options);
      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * Get the best RPC recommendation for a chain
   */
  async getBestRpc(
    chain: ChainType, 
    options: BenchmarkOptions = {}
  ): Promise<RpcRecommendation | null> {
    const results = await this.benchmarkChain(chain, options);
    return recommendBestRpc(results, chain);
  }

  /**
   * Get recommendations for all chains
   */
  async getAllRecommendations(
    options: BenchmarkOptions = {}
  ): Promise<Map<ChainType, RpcRecommendation | null>> {
    const results = await this.benchmarkAll(options);
    return recommendAllChains(results);
  }

  /**
   * Find the fastest RPC for a chain (quick check, less accurate)
   */
  async findFastest(chain: ChainType, timeout: number = 3000): Promise<RpcEndpoint | null> {
    const results = await this.checkChain(chain, timeout);
    const healthy = results
      .filter(r => r.isHealthy)
      .sort((a, b) => a.latencyMs - b.latencyMs);

    return healthy.length > 0 ? healthy[0].endpoint : null;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Create a new RPC Optimizer instance
 */
export function createOptimizer(config?: OptimizerConfig): RpcOptimizer {
  return new RpcOptimizer(config);
}

