import { RpcEndpoint, HealthCheckResult, ChainType } from '../types';

/**
 * Default timeout for health checks (5 seconds)
 */
const DEFAULT_TIMEOUT = 5000;

/**
 * JSON-RPC request payload for getting block number (EVM chains)
 */
const EVM_BLOCK_NUMBER_PAYLOAD = {
  jsonrpc: '2.0',
  method: 'eth_blockNumber',
  params: [],
  id: 1,
};

/**
 * JSON-RPC request payload for Solana slot
 */
const SOLANA_SLOT_PAYLOAD = {
  jsonrpc: '2.0',
  method: 'getSlot',
  params: [],
  id: 1,
};

/**
 * Check if a chain is EVM-based
 */
function isEvmChain(chain: ChainType): boolean {
  return chain !== 'solana';
}

/**
 * Get the appropriate RPC payload for a chain
 */
function getRpcPayload(chain: ChainType): object {
  return isEvmChain(chain) ? EVM_BLOCK_NUMBER_PAYLOAD : SOLANA_SLOT_PAYLOAD;
}

/**
 * Parse block height from RPC response
 */
function parseBlockHeight(chain: ChainType, result: unknown): number | null {
  if (result === null || result === undefined) return null;
  
  if (isEvmChain(chain)) {
    // EVM returns hex string like "0x1234567"
    if (typeof result === 'string' && result.startsWith('0x')) {
      return parseInt(result, 16);
    }
  } else {
    // Solana returns number directly
    if (typeof result === 'number') {
      return result;
    }
  }
  
  return null;
}

/**
 * Perform a health check on a single RPC endpoint
 */
export async function checkHealth(
  endpoint: RpcEndpoint,
  timeout: number = DEFAULT_TIMEOUT
): Promise<HealthCheckResult> {
  const startTime = performance.now();
  const timestamp = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getRpcPayload(endpoint.chain)),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const latencyMs = performance.now() - startTime;

    if (!response.ok) {
      return {
        endpoint,
        isHealthy: false,
        latencyMs,
        blockHeight: null,
        timestamp,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        endpoint,
        isHealthy: false,
        latencyMs,
        blockHeight: null,
        timestamp,
        error: data.error.message || 'RPC error',
      };
    }

    const blockHeight = parseBlockHeight(endpoint.chain, data.result);

    return {
      endpoint,
      isHealthy: true,
      latencyMs,
      blockHeight,
      timestamp,
    };
  } catch (error) {
    const latencyMs = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      endpoint,
      isHealthy: false,
      latencyMs,
      blockHeight: null,
      timestamp,
      error: errorMessage.includes('abort') ? 'Timeout' : errorMessage,
    };
  }
}

/**
 * Check health of multiple endpoints in parallel
 */
export async function checkHealthBatch(
  endpoints: RpcEndpoint[],
  timeout: number = DEFAULT_TIMEOUT
): Promise<HealthCheckResult[]> {
  const promises = endpoints.map(endpoint => checkHealth(endpoint, timeout));
  return Promise.all(promises);
}

