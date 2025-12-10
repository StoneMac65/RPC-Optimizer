import { RpcEndpoint, ChainType } from '../types';

/**
 * DefiLlama/LlamaNodes RPC Endpoints
 * Source: https://llamarpc.com (part of DefiLlama ecosystem)
 * 
 * These are high-quality, privacy-focused RPC endpoints provided by LlamaNodes.
 * They offer both free public and premium endpoints.
 */

/**
 * LlamaNodes RPC endpoints (free tier)
 * These are reliable, privacy-first endpoints from the DefiLlama team
 */
export const LLAMA_RPC_ENDPOINTS: RpcEndpoint[] = [
  // Ethereum
  { url: 'https://eth.llamarpc.com', name: 'LlamaRPC', chain: 'ethereum', isPublic: true, provider: 'DefiLlama' },
  { url: 'https://eth.drpc.org', name: 'dRPC', chain: 'ethereum', isPublic: true, provider: 'dRPC' },
  { url: 'https://ethereum.publicnode.com', name: 'PublicNode', chain: 'ethereum', isPublic: true, provider: 'PublicNode' },
  { url: 'https://rpc.ankr.com/eth', name: 'Ankr', chain: 'ethereum', isPublic: true, provider: 'Ankr' },
  { url: 'https://1rpc.io/eth', name: '1RPC', chain: 'ethereum', isPublic: true, provider: '1RPC' },
  { url: 'https://eth-mainnet.public.blastapi.io', name: 'BlastAPI', chain: 'ethereum', isPublic: true, provider: 'BlastAPI' },
  
  // Polygon
  { url: 'https://polygon.llamarpc.com', name: 'LlamaRPC', chain: 'polygon', isPublic: true, provider: 'DefiLlama' },
  { url: 'https://polygon.drpc.org', name: 'dRPC', chain: 'polygon', isPublic: true, provider: 'dRPC' },
  { url: 'https://polygon-bor-rpc.publicnode.com', name: 'PublicNode', chain: 'polygon', isPublic: true, provider: 'PublicNode' },
  { url: 'https://rpc.ankr.com/polygon', name: 'Ankr', chain: 'polygon', isPublic: true, provider: 'Ankr' },
  { url: 'https://1rpc.io/matic', name: '1RPC', chain: 'polygon', isPublic: true, provider: '1RPC' },
  { url: 'https://polygon-mainnet.public.blastapi.io', name: 'BlastAPI', chain: 'polygon', isPublic: true, provider: 'BlastAPI' },
  
  // BSC (Binance Smart Chain)
  { url: 'https://binance.llamarpc.com', name: 'LlamaRPC', chain: 'bsc', isPublic: true, provider: 'DefiLlama' },
  { url: 'https://bsc.drpc.org', name: 'dRPC', chain: 'bsc', isPublic: true, provider: 'dRPC' },
  { url: 'https://bsc-rpc.publicnode.com', name: 'PublicNode', chain: 'bsc', isPublic: true, provider: 'PublicNode' },
  { url: 'https://rpc.ankr.com/bsc', name: 'Ankr', chain: 'bsc', isPublic: true, provider: 'Ankr' },
  { url: 'https://1rpc.io/bnb', name: '1RPC', chain: 'bsc', isPublic: true, provider: '1RPC' },
  { url: 'https://bsc-mainnet.public.blastapi.io', name: 'BlastAPI', chain: 'bsc', isPublic: true, provider: 'BlastAPI' },
  
  // Arbitrum
  { url: 'https://arbitrum.llamarpc.com', name: 'LlamaRPC', chain: 'arbitrum', isPublic: true, provider: 'DefiLlama' },
  { url: 'https://arbitrum.drpc.org', name: 'dRPC', chain: 'arbitrum', isPublic: true, provider: 'dRPC' },
  { url: 'https://arbitrum-one-rpc.publicnode.com', name: 'PublicNode', chain: 'arbitrum', isPublic: true, provider: 'PublicNode' },
  { url: 'https://rpc.ankr.com/arbitrum', name: 'Ankr', chain: 'arbitrum', isPublic: true, provider: 'Ankr' },
  { url: 'https://1rpc.io/arb', name: '1RPC', chain: 'arbitrum', isPublic: true, provider: '1RPC' },
  { url: 'https://arbitrum-one.public.blastapi.io', name: 'BlastAPI', chain: 'arbitrum', isPublic: true, provider: 'BlastAPI' },
  
  // Optimism
  { url: 'https://optimism.llamarpc.com', name: 'LlamaRPC', chain: 'optimism', isPublic: true, provider: 'DefiLlama' },
  { url: 'https://optimism.drpc.org', name: 'dRPC', chain: 'optimism', isPublic: true, provider: 'dRPC' },
  { url: 'https://optimism-rpc.publicnode.com', name: 'PublicNode', chain: 'optimism', isPublic: true, provider: 'PublicNode' },
  { url: 'https://rpc.ankr.com/optimism', name: 'Ankr', chain: 'optimism', isPublic: true, provider: 'Ankr' },
  { url: 'https://1rpc.io/op', name: '1RPC', chain: 'optimism', isPublic: true, provider: '1RPC' },
  { url: 'https://optimism-mainnet.public.blastapi.io', name: 'BlastAPI', chain: 'optimism', isPublic: true, provider: 'BlastAPI' },
  
  // Avalanche C-Chain
  { url: 'https://avalanche.drpc.org', name: 'dRPC', chain: 'avalanche', isPublic: true, provider: 'dRPC' },
  { url: 'https://avalanche-c-chain-rpc.publicnode.com', name: 'PublicNode', chain: 'avalanche', isPublic: true, provider: 'PublicNode' },
  { url: 'https://rpc.ankr.com/avalanche', name: 'Ankr', chain: 'avalanche', isPublic: true, provider: 'Ankr' },
  { url: 'https://1rpc.io/avax/c', name: '1RPC', chain: 'avalanche', isPublic: true, provider: '1RPC' },
  { url: 'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc', name: 'BlastAPI', chain: 'avalanche', isPublic: true, provider: 'BlastAPI' },
  
  // Base
  { url: 'https://base.llamarpc.com', name: 'LlamaRPC', chain: 'base', isPublic: true, provider: 'DefiLlama' },
  { url: 'https://base.drpc.org', name: 'dRPC', chain: 'base', isPublic: true, provider: 'dRPC' },
  { url: 'https://base-rpc.publicnode.com', name: 'PublicNode', chain: 'base', isPublic: true, provider: 'PublicNode' },
  { url: 'https://rpc.ankr.com/base', name: 'Ankr', chain: 'base', isPublic: true, provider: 'Ankr' },
  { url: 'https://1rpc.io/base', name: '1RPC', chain: 'base', isPublic: true, provider: '1RPC' },
  { url: 'https://base-mainnet.public.blastapi.io', name: 'BlastAPI', chain: 'base', isPublic: true, provider: 'BlastAPI' },
  
  // Solana (non-EVM)
  { url: 'https://solana.drpc.org', name: 'dRPC', chain: 'solana', isPublic: true, provider: 'dRPC' },
  { url: 'https://solana-rpc.publicnode.com', name: 'PublicNode', chain: 'solana', isPublic: true, provider: 'PublicNode' },
];

/**
 * Get all DefiLlama/LlamaNodes RPC endpoints
 */
export function getDefiLlamaEndpoints(): RpcEndpoint[] {
  return [...LLAMA_RPC_ENDPOINTS];
}

/**
 * Get DefiLlama endpoints for a specific chain
 */
export function getDefiLlamaEndpointsByChain(chain: ChainType): RpcEndpoint[] {
  return LLAMA_RPC_ENDPOINTS.filter(endpoint => endpoint.chain === chain);
}

/**
 * Get all supported chains from DefiLlama endpoints
 */
export function getDefiLlamaSupportedChains(): ChainType[] {
  const chains = new Set<ChainType>();
  LLAMA_RPC_ENDPOINTS.forEach(endpoint => chains.add(endpoint.chain));
  return Array.from(chains);
}

/**
 * Additional high-quality RPC providers (curated list from DefiLlama/ChainList ecosystem)
 */
export const PREMIUM_PROVIDERS = [
  { name: 'LlamaNodes', url: 'https://llamarpc.com', description: 'Privacy-first, part of DefiLlama' },
  { name: 'dRPC', url: 'https://drpc.org', description: 'Decentralized RPC network' },
  { name: 'PublicNode', url: 'https://publicnode.com', description: 'Fast, free, privacy-focused' },
  { name: 'Ankr', url: 'https://ankr.com', description: 'Multi-chain infrastructure' },
  { name: '1RPC', url: 'https://1rpc.io', description: 'Privacy-preserving RPC relay' },
  { name: 'BlastAPI', url: 'https://blastapi.io', description: 'High-performance endpoints' },
];

