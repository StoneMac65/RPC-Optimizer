import { RpcEndpoint, ChainType } from '../types';

/**
 * ChainList API response types
 */
interface ChainListRpc {
  url: string;
  tracking?: string;
  trackingDetails?: string;
  isOpenSource?: boolean;
}

interface ChainListChain {
  name: string;
  chain: string;
  chainId: number;
  rpc: (string | ChainListRpc)[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
}

/**
 * Chain ID to ChainType mapping
 */
const CHAIN_ID_MAP: Record<number, ChainType> = {
  1: 'ethereum',
  137: 'polygon',
  56: 'bsc',
  42161: 'arbitrum',
  10: 'optimism',
  43114: 'avalanche',
  8453: 'base',
};

/**
 * ChainList data URL (uses the chains.json from their repo)
 */
const CHAINLIST_URL = 'https://chainid.network/chains.json';

/**
 * Alternative: DefiLlama's chainlist
 */
const DEFILLAMA_URL = 'https://chainlist.org/rpcs.json';

/**
 * Cache for fetched chains
 */
let chainsCache: ChainListChain[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch all chains from ChainList
 */
export async function fetchChainList(): Promise<ChainListChain[]> {
  // Return cached if valid
  if (chainsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return chainsCache;
  }

  try {
    const response = await fetch(CHAINLIST_URL, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ChainList: ${response.status}`);
    }

    chainsCache = await response.json();
    cacheTimestamp = Date.now();
    return chainsCache!;
  } catch (error) {
    console.error('ChainList fetch error:', error);
    // Return cached even if expired, as fallback
    if (chainsCache) return chainsCache;
    throw error;
  }
}

/**
 * Filter valid HTTPS RPC URLs
 */
function filterValidRpcs(rpcs: (string | ChainListRpc)[]): string[] {
  return rpcs
    .map(rpc => typeof rpc === 'string' ? rpc : rpc.url)
    .filter(url => {
      // Only HTTPS, no variables like ${API_KEY}
      return url.startsWith('https://') && 
             !url.includes('${') && 
             !url.includes('API_KEY') &&
             !url.includes('INFURA') &&
             !url.includes('ALCHEMY');
    });
}

/**
 * Extract provider name from URL
 */
function extractProvider(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    // Get the main domain part
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0).toUpperCase() + 
             parts[parts.length - 2].slice(1);
    }
    return hostname;
  } catch {
    return 'Unknown';
  }
}

/**
 * Fetch RPCs for a specific chain by chain ID
 */
export async function fetchRpcsByChainId(chainId: number): Promise<RpcEndpoint[]> {
  const chains = await fetchChainList();
  const chain = chains.find(c => c.chainId === chainId);
  
  if (!chain) {
    return [];
  }

  const chainType = CHAIN_ID_MAP[chainId];
  if (!chainType) {
    return [];
  }

  const validUrls = filterValidRpcs(chain.rpc);
  
  return validUrls.map(url => ({
    url,
    name: extractProvider(url),
    chain: chainType,
    isPublic: true,
    provider: extractProvider(url),
  }));
}

/**
 * Fetch RPCs for a ChainType
 */
export async function fetchRpcsByChain(chain: ChainType): Promise<RpcEndpoint[]> {
  const chainIdMap: Record<ChainType, number> = {
    ethereum: 1,
    polygon: 137,
    bsc: 56,
    arbitrum: 42161,
    optimism: 10,
    avalanche: 43114,
    base: 8453,
    solana: 0, // Solana is not on ChainList (not EVM)
  };

  const chainId = chainIdMap[chain];
  if (chainId === 0) {
    // Return empty for non-EVM chains
    return [];
  }

  return fetchRpcsByChainId(chainId);
}

/**
 * Fetch all supported chain RPCs
 */
export async function fetchAllRpcs(): Promise<RpcEndpoint[]> {
  const chains: ChainType[] = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'avalanche', 'base'];
  const results = await Promise.all(chains.map(chain => fetchRpcsByChain(chain)));
  return results.flat();
}

/**
 * Clear the cache to force refresh
 */
export function clearChainListCache(): void {
  chainsCache = null;
  cacheTimestamp = 0;
}

