import { BenchmarkResult, RpcRecommendation, ChainType } from '../types';

/**
 * Generate recommendation reason based on metrics
 */
function generateReason(result: BenchmarkResult): string {
  const reasons: string[] = [];

  if (result.successRate === 1) {
    reasons.push('100% reliability');
  } else if (result.successRate >= 0.9) {
    reasons.push(`${Math.round(result.successRate * 100)}% success rate`);
  }

  if (result.avgLatencyMs < 100) {
    reasons.push('excellent latency (<100ms)');
  } else if (result.avgLatencyMs < 200) {
    reasons.push('good latency (<200ms)');
  }

  if (result.blockDelay === 0) {
    reasons.push('up-to-date block height');
  } else if (result.blockDelay <= 2) {
    reasons.push(`only ${result.blockDelay} block(s) behind`);
  }

  if (result.score >= 90) {
    reasons.unshift('Top performer');
  } else if (result.score >= 80) {
    reasons.unshift('Strong performer');
  }

  return reasons.length > 0 ? reasons.join(', ') : 'Best available option';
}

/**
 * Recommend the best RPC from benchmark results
 */
export function recommendBestRpc(
  results: BenchmarkResult[],
  chain: ChainType
): RpcRecommendation | null {
  // Filter to only healthy endpoints with reasonable scores
  const validResults = results
    .filter(r => r.successRate > 0 && r.endpoint.chain === chain)
    .sort((a, b) => b.score - a.score);

  if (validResults.length === 0) {
    return null;
  }

  const recommended = validResults[0];
  const alternatives = validResults.slice(1, 4); // Top 3 alternatives

  return {
    recommended,
    alternatives,
    chain,
    reason: generateReason(recommended),
    timestamp: Date.now(),
  };
}

/**
 * Get recommendations for multiple chains
 */
export function recommendAllChains(
  results: BenchmarkResult[]
): Map<ChainType, RpcRecommendation | null> {
  const chains = [...new Set(results.map(r => r.endpoint.chain))];
  const recommendations = new Map<ChainType, RpcRecommendation | null>();

  for (const chain of chains) {
    recommendations.set(chain, recommendBestRpc(results, chain));
  }

  return recommendations;
}

/**
 * Format recommendation as a simple object for JSON output
 */
export function formatRecommendation(rec: RpcRecommendation): object {
  return {
    chain: rec.chain,
    recommended: {
      url: rec.recommended.endpoint.url,
      name: rec.recommended.endpoint.name,
      provider: rec.recommended.endpoint.provider,
      score: rec.recommended.score,
      latencyMs: rec.recommended.avgLatencyMs,
      successRate: `${Math.round(rec.recommended.successRate * 100)}%`,
    },
    alternatives: rec.alternatives.map(alt => ({
      url: alt.endpoint.url,
      name: alt.endpoint.name,
      score: alt.score,
      latencyMs: alt.avgLatencyMs,
    })),
    reason: rec.reason,
  };
}

