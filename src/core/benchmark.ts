import { RpcEndpoint, BenchmarkResult, BenchmarkOptions, HealthCheckResult } from '../types';
import { checkHealth } from './health-check';

/**
 * Default benchmark options
 */
const DEFAULT_OPTIONS: Required<BenchmarkOptions> = {
  samples: 5,
  timeout: 5000,
  parallel: true,
  chain: 'ethereum',
};

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedArr.length) - 1;
  return sortedArr[Math.max(0, index)];
}

/**
 * Calculate average of array
 */
function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Benchmark a single RPC endpoint with multiple samples
 */
export async function benchmarkEndpoint(
  endpoint: RpcEndpoint,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const results: HealthCheckResult[] = [];

  // Collect samples
  for (let i = 0; i < opts.samples; i++) {
    const result = await checkHealth(endpoint, opts.timeout);
    results.push(result);
    
    // Small delay between requests to avoid rate limiting
    if (i < opts.samples - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Calculate metrics
  const successfulResults = results.filter(r => r.isHealthy);
  const latencies = successfulResults.map(r => r.latencyMs).sort((a, b) => a - b);
  const blockHeights = successfulResults
    .map(r => r.blockHeight)
    .filter((h): h is number => h !== null);

  const successRate = successfulResults.length / results.length;
  const avgLatencyMs = average(latencies);
  const minLatencyMs = latencies.length > 0 ? latencies[0] : opts.timeout;
  const maxLatencyMs = latencies.length > 0 ? latencies[latencies.length - 1] : opts.timeout;
  const p95LatencyMs = percentile(latencies, 95);
  const blockHeight = blockHeights.length > 0 ? Math.max(...blockHeights) : null;

  return {
    endpoint,
    avgLatencyMs: Math.round(avgLatencyMs * 100) / 100,
    minLatencyMs: Math.round(minLatencyMs * 100) / 100,
    maxLatencyMs: Math.round(maxLatencyMs * 100) / 100,
    p95LatencyMs: Math.round(p95LatencyMs * 100) / 100,
    successRate: Math.round(successRate * 100) / 100,
    blockHeight,
    blockDelay: 0, // Will be calculated in batch
    score: 0, // Will be calculated after all benchmarks
    timestamp: Date.now(),
    sampleCount: opts.samples,
  };
}

/**
 * Benchmark multiple endpoints
 */
export async function benchmarkEndpoints(
  endpoints: RpcEndpoint[],
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let results: BenchmarkResult[];

  if (opts.parallel) {
    // Run all benchmarks in parallel
    results = await Promise.all(
      endpoints.map(endpoint => benchmarkEndpoint(endpoint, options))
    );
  } else {
    // Run benchmarks sequentially
    results = [];
    for (const endpoint of endpoints) {
      const result = await benchmarkEndpoint(endpoint, options);
      results.push(result);
    }
  }

  // Calculate block delays and scores
  const maxBlockHeight = Math.max(
    ...results.map(r => r.blockHeight ?? 0)
  );

  return results.map(result => {
    const blockDelay = result.blockHeight !== null 
      ? maxBlockHeight - result.blockHeight 
      : 999;
    
    const score = calculateScore(result, blockDelay);

    return {
      ...result,
      blockDelay,
      score,
    };
  });
}

/**
 * Calculate overall score (0-100) for an RPC endpoint
 */
function calculateScore(result: BenchmarkResult, blockDelay: number): number {
  // Weight factors
  const LATENCY_WEIGHT = 0.35;
  const SUCCESS_WEIGHT = 0.35;
  const BLOCK_DELAY_WEIGHT = 0.20;
  const CONSISTENCY_WEIGHT = 0.10;

  // Latency score (lower is better, max 500ms for full score)
  const latencyScore = Math.max(0, 100 - (result.avgLatencyMs / 5));

  // Success rate score
  const successScore = result.successRate * 100;

  // Block delay score (0 delay = 100, each block behind = -10)
  const blockDelayScore = Math.max(0, 100 - (blockDelay * 10));

  // Consistency score (lower variance is better)
  const variance = result.maxLatencyMs - result.minLatencyMs;
  const consistencyScore = Math.max(0, 100 - (variance / 5));

  const totalScore = 
    latencyScore * LATENCY_WEIGHT +
    successScore * SUCCESS_WEIGHT +
    blockDelayScore * BLOCK_DELAY_WEIGHT +
    consistencyScore * CONSISTENCY_WEIGHT;

  return Math.round(Math.max(0, Math.min(100, totalScore)));
}

