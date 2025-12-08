import { RpcEndpoint, ChainType } from '../types';
import { CHAIN_IDS } from '../chains/endpoints';

/**
 * Chain metadata for wallet integration
 */
const CHAIN_METADATA: Record<Exclude<ChainType, 'solana'>, {
  name: string;
  symbol: string;
  decimals: number;
  explorer: string;
}> = {
  ethereum: { name: 'Ethereum', symbol: 'ETH', decimals: 18, explorer: 'https://etherscan.io' },
  polygon: { name: 'Polygon', symbol: 'MATIC', decimals: 18, explorer: 'https://polygonscan.com' },
  bsc: { name: 'BNB Smart Chain', symbol: 'BNB', decimals: 18, explorer: 'https://bscscan.com' },
  arbitrum: { name: 'Arbitrum One', symbol: 'ETH', decimals: 18, explorer: 'https://arbiscan.io' },
  optimism: { name: 'Optimism', symbol: 'ETH', decimals: 18, explorer: 'https://optimistic.etherscan.io' },
  avalanche: { name: 'Avalanche C-Chain', symbol: 'AVAX', decimals: 18, explorer: 'https://snowtrace.io' },
  base: { name: 'Base', symbol: 'ETH', decimals: 18, explorer: 'https://basescan.org' },
};

/**
 * Check if we're in a browser with an injected wallet
 */
export function hasInjectedWallet(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
}

/**
 * Get the injected wallet provider
 */
export function getWalletProvider(): any {
  if (!hasInjectedWallet()) {
    throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
  }
  return (window as any).ethereum;
}

/**
 * Request wallet connection
 */
export async function connectWallet(): Promise<string[]> {
  const provider = getWalletProvider();
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  return accounts;
}

/**
 * Add or switch to a network with the specified RPC
 * Uses wallet_addEthereumChain which adds if not exists, or switches if exists
 */
export async function addNetworkToWallet(endpoint: RpcEndpoint): Promise<boolean> {
  if (endpoint.chain === 'solana') {
    throw new Error('Solana is not supported for MetaMask integration');
  }

  const provider = getWalletProvider();
  const chainId = CHAIN_IDS[endpoint.chain];
  const metadata = CHAIN_METADATA[endpoint.chain];

  const chainIdHex = `0x${chainId.toString(16)}`;

  try {
    // First try to switch to the chain
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // Chain not added yet, add it
    if (switchError.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: `${metadata.name} (Optimized)`,
          nativeCurrency: {
            name: metadata.symbol,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
          },
          rpcUrls: [endpoint.url],
          blockExplorerUrls: [metadata.explorer],
        }],
      });
      return true;
    }
    throw switchError;
  }
}

/**
 * Generate wallet-compatible network config (for manual import)
 */
export function generateNetworkConfig(endpoint: RpcEndpoint): object {
  if (endpoint.chain === 'solana') {
    return {
      name: 'Solana Mainnet (Optimized)',
      rpcUrl: endpoint.url,
      network: 'mainnet-beta',
    };
  }

  const chainId = CHAIN_IDS[endpoint.chain];
  const metadata = CHAIN_METADATA[endpoint.chain];

  return {
    chainId: chainId,
    chainIdHex: `0x${chainId.toString(16)}`,
    chainName: `${metadata.name} (Optimized RPC)`,
    rpcUrl: endpoint.url,
    nativeCurrency: {
      name: metadata.symbol,
      symbol: metadata.symbol,
      decimals: metadata.decimals,
    },
    blockExplorerUrl: metadata.explorer,
    provider: endpoint.provider,
  };
}

/**
 * Generate Trust Wallet deep link
 */
export function generateTrustWalletLink(endpoint: RpcEndpoint): string | null {
  if (endpoint.chain === 'solana') return null;
  
  const chainId = CHAIN_IDS[endpoint.chain];
  // Trust Wallet deep link format
  return `trust://add_network?chain_id=${chainId}&rpc_url=${encodeURIComponent(endpoint.url)}`;
}

/**
 * Generate Rainbow Wallet deep link  
 */
export function generateRainbowLink(endpoint: RpcEndpoint): string | null {
  if (endpoint.chain === 'solana') return null;
  
  const chainId = CHAIN_IDS[endpoint.chain];
  return `rainbow://network?chainId=${chainId}&rpcUrl=${encodeURIComponent(endpoint.url)}`;
}

/**
 * Copy RPC URL to clipboard (browser only)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

/**
 * All-in-one: Apply best RPC to wallet
 */
export async function applyToWallet(endpoint: RpcEndpoint): Promise<{
  success: boolean;
  method: 'injected' | 'clipboard' | 'none';
  message: string;
}> {
  // Try injected wallet first (MetaMask, etc.)
  if (hasInjectedWallet() && endpoint.chain !== 'solana') {
    try {
      await addNetworkToWallet(endpoint);
      return {
        success: true,
        method: 'injected',
        message: `Successfully added ${endpoint.name} RPC to your wallet!`,
      };
    } catch (error) {
      // Fall through to clipboard
    }
  }

  // Fallback to clipboard
  const copied = await copyToClipboard(endpoint.url);
  if (copied) {
    return {
      success: true,
      method: 'clipboard',
      message: `RPC URL copied to clipboard. Paste it in your wallet settings.`,
    };
  }

  return {
    success: false,
    method: 'none',
    message: 'Could not apply RPC. Please copy manually: ' + endpoint.url,
  };
}

