import { RpcEndpoint, ChainType } from '../types';

/**
 * Public RPC endpoints for major blockchain networks
 * Sources: ChainList, official docs, community resources
 */
export const PUBLIC_RPC_ENDPOINTS: RpcEndpoint[] = [
  // Ethereum Mainnet
  { url: 'https://eth.llamarpc.com', name: 'LlamaRPC', chain: 'ethereum', isPublic: true, provider: 'LlamaNodes' },
  { url: 'https://rpc.ankr.com/eth', name: 'Ankr', chain: 'ethereum', isPublic: true, provider: 'Ankr' },
  { url: 'https://ethereum.publicnode.com', name: 'PublicNode', chain: 'ethereum', isPublic: true, provider: 'PublicNode' },
  { url: 'https://1rpc.io/eth', name: '1RPC', chain: 'ethereum', isPublic: true, provider: 'Automata' },
  { url: 'https://eth.drpc.org', name: 'dRPC', chain: 'ethereum', isPublic: true, provider: 'dRPC' },
  { url: 'https://rpc.payload.de', name: 'Payload', chain: 'ethereum', isPublic: true, provider: 'Payload' },
  { url: 'https://eth.merkle.io', name: 'Merkle', chain: 'ethereum', isPublic: true, provider: 'Merkle' },
  { url: 'https://cloudflare-eth.com', name: 'Cloudflare', chain: 'ethereum', isPublic: true, provider: 'Cloudflare' },

  // Polygon Mainnet
  { url: 'https://polygon.llamarpc.com', name: 'LlamaRPC', chain: 'polygon', isPublic: true, provider: 'LlamaNodes' },
  { url: 'https://rpc.ankr.com/polygon', name: 'Ankr', chain: 'polygon', isPublic: true, provider: 'Ankr' },
  { url: 'https://polygon-bor-rpc.publicnode.com', name: 'PublicNode', chain: 'polygon', isPublic: true, provider: 'PublicNode' },
  { url: 'https://1rpc.io/matic', name: '1RPC', chain: 'polygon', isPublic: true, provider: 'Automata' },
  { url: 'https://polygon.drpc.org', name: 'dRPC', chain: 'polygon', isPublic: true, provider: 'dRPC' },
  { url: 'https://polygon-rpc.com', name: 'Polygon', chain: 'polygon', isPublic: true, provider: 'Polygon' },

  // BSC (BNB Smart Chain)
  { url: 'https://bsc-dataseed1.binance.org', name: 'Binance 1', chain: 'bsc', isPublic: true, provider: 'Binance' },
  { url: 'https://bsc-dataseed2.binance.org', name: 'Binance 2', chain: 'bsc', isPublic: true, provider: 'Binance' },
  { url: 'https://rpc.ankr.com/bsc', name: 'Ankr', chain: 'bsc', isPublic: true, provider: 'Ankr' },
  { url: 'https://bsc.publicnode.com', name: 'PublicNode', chain: 'bsc', isPublic: true, provider: 'PublicNode' },
  { url: 'https://1rpc.io/bnb', name: '1RPC', chain: 'bsc', isPublic: true, provider: 'Automata' },
  { url: 'https://bsc.drpc.org', name: 'dRPC', chain: 'bsc', isPublic: true, provider: 'dRPC' },

  // Arbitrum One
  { url: 'https://arb1.arbitrum.io/rpc', name: 'Arbitrum', chain: 'arbitrum', isPublic: true, provider: 'Offchain Labs' },
  { url: 'https://rpc.ankr.com/arbitrum', name: 'Ankr', chain: 'arbitrum', isPublic: true, provider: 'Ankr' },
  { url: 'https://arbitrum.publicnode.com', name: 'PublicNode', chain: 'arbitrum', isPublic: true, provider: 'PublicNode' },
  { url: 'https://1rpc.io/arb', name: '1RPC', chain: 'arbitrum', isPublic: true, provider: 'Automata' },
  { url: 'https://arbitrum.drpc.org', name: 'dRPC', chain: 'arbitrum', isPublic: true, provider: 'dRPC' },
  { url: 'https://arbitrum.llamarpc.com', name: 'LlamaRPC', chain: 'arbitrum', isPublic: true, provider: 'LlamaNodes' },

  // Optimism
  { url: 'https://mainnet.optimism.io', name: 'Optimism', chain: 'optimism', isPublic: true, provider: 'Optimism' },
  { url: 'https://rpc.ankr.com/optimism', name: 'Ankr', chain: 'optimism', isPublic: true, provider: 'Ankr' },
  { url: 'https://optimism.publicnode.com', name: 'PublicNode', chain: 'optimism', isPublic: true, provider: 'PublicNode' },
  { url: 'https://1rpc.io/op', name: '1RPC', chain: 'optimism', isPublic: true, provider: 'Automata' },
  { url: 'https://optimism.drpc.org', name: 'dRPC', chain: 'optimism', isPublic: true, provider: 'dRPC' },
  { url: 'https://optimism.llamarpc.com', name: 'LlamaRPC', chain: 'optimism', isPublic: true, provider: 'LlamaNodes' },

  // Avalanche C-Chain
  { url: 'https://api.avax.network/ext/bc/C/rpc', name: 'Avalanche', chain: 'avalanche', isPublic: true, provider: 'Ava Labs' },
  { url: 'https://rpc.ankr.com/avalanche', name: 'Ankr', chain: 'avalanche', isPublic: true, provider: 'Ankr' },
  { url: 'https://avalanche-c-chain-rpc.publicnode.com', name: 'PublicNode', chain: 'avalanche', isPublic: true, provider: 'PublicNode' },
  { url: 'https://1rpc.io/avax/c', name: '1RPC', chain: 'avalanche', isPublic: true, provider: 'Automata' },
  { url: 'https://avax.meowrpc.com', name: 'MeowRPC', chain: 'avalanche', isPublic: true, provider: 'MeowRPC' },

  // Base
  { url: 'https://mainnet.base.org', name: 'Base', chain: 'base', isPublic: true, provider: 'Coinbase' },
  { url: 'https://rpc.ankr.com/base', name: 'Ankr', chain: 'base', isPublic: true, provider: 'Ankr' },
  { url: 'https://base.publicnode.com', name: 'PublicNode', chain: 'base', isPublic: true, provider: 'PublicNode' },
  { url: 'https://1rpc.io/base', name: '1RPC', chain: 'base', isPublic: true, provider: 'Automata' },
  { url: 'https://base.drpc.org', name: 'dRPC', chain: 'base', isPublic: true, provider: 'dRPC' },
  { url: 'https://base.llamarpc.com', name: 'LlamaRPC', chain: 'base', isPublic: true, provider: 'LlamaNodes' },

  // Solana
  { url: 'https://api.mainnet-beta.solana.com', name: 'Solana', chain: 'solana', isPublic: true, provider: 'Solana Foundation' },
  { url: 'https://rpc.ankr.com/solana', name: 'Ankr', chain: 'solana', isPublic: true, provider: 'Ankr' },
  { url: 'https://solana.publicnode.com', name: 'PublicNode', chain: 'solana', isPublic: true, provider: 'PublicNode' },
];

/**
 * Get endpoints for a specific chain
 */
export function getEndpointsByChain(chain: ChainType): RpcEndpoint[] {
  return PUBLIC_RPC_ENDPOINTS.filter(e => e.chain === chain);
}

/**
 * Get all supported chains
 */
export function getSupportedChains(): ChainType[] {
  return [...new Set(PUBLIC_RPC_ENDPOINTS.map(e => e.chain))];
}

/**
 * Chain ID mapping for EVM chains
 */
export const CHAIN_IDS: Record<Exclude<ChainType, 'solana'>, number> = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  arbitrum: 42161,
  optimism: 10,
  avalanche: 43114,
  base: 8453,
};

