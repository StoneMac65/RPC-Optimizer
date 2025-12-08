/**
 * Supported blockchain networks
 */
export type ChainType = 
  | 'ethereum'
  | 'polygon'
  | 'bsc'
  | 'arbitrum'
  | 'optimism'
  | 'avalanche'
  | 'base'
  | 'solana';

/**
 * RPC endpoint configuration
 */
export interface RpcEndpoint {
  url: string;
  name: string;
  chain: ChainType;
  isPublic: boolean;
  provider?: string;
}

/**
 * Result of a single RPC health check
 */
export interface HealthCheckResult {
  endpoint: RpcEndpoint;
  isHealthy: boolean;
  latencyMs: number;
  blockHeight: number | null;
  timestamp: number;
  error?: string;
}

/**
 * Comprehensive benchmark result for an RPC endpoint
 */
export interface BenchmarkResult {
  endpoint: RpcEndpoint;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
  successRate: number;
  blockHeight: number | null;
  blockDelay: number; // blocks behind the highest
  score: number; // 0-100 overall score
  timestamp: number;
  sampleCount: number;
}

/**
 * Options for benchmarking
 */
export interface BenchmarkOptions {
  /** Number of requests to make per endpoint */
  samples?: number;
  /** Timeout per request in ms */
  timeout?: number;
  /** Run benchmarks in parallel */
  parallel?: boolean;
  /** Specific chain to benchmark */
  chain?: ChainType;
}

/**
 * RPC recommendation with reasoning
 */
export interface RpcRecommendation {
  recommended: BenchmarkResult;
  alternatives: BenchmarkResult[];
  chain: ChainType;
  reason: string;
  timestamp: number;
}

/**
 * Configuration for the RPC Optimizer
 */
export interface OptimizerConfig {
  /** Custom RPC endpoints to include */
  customEndpoints?: RpcEndpoint[];
  /** Chains to include in benchmarks */
  chains?: ChainType[];
  /** Default benchmark options */
  defaultBenchmarkOptions?: BenchmarkOptions;
  /** Cache duration in ms */
  cacheDuration?: number;
}

