import {
  mainnet,
  sepolia,
  arbitrum,
  arbitrumSepolia,
  bsc,
  bscTestnet,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
} from 'viem/chains';

import { AppMode } from '@/types/app';

const MAINNET_CHAINS = {
  ethereum: mainnet,
  arbitrum,
  bsc,
  base,
  optimism,
};

const TESTNET_CHAINS = {
  sepolia,
  arbitrumSepolia,
  bscTestnet,
  baseSepolia,
  optimismSepolia,
};

export const NETWORKS = {
  production: MAINNET_CHAINS,
  test: TESTNET_CHAINS,
  local_test: {
    // Support both mainnet and testnet chains
    ...MAINNET_CHAINS,
    ...TESTNET_CHAINS,
  },
  local: {
    // Support both mainnet and testnet chains
    ...MAINNET_CHAINS,
    ...TESTNET_CHAINS,
  },
};

// Base RPC URLs to avoid repetition

const MAINNET_RPC_URLS = {
  ethereum:
    process.env.ETHEREUM_RPC_URL ||
    'https://ethereum.rpc.subquery.network/public',
  arbitrum:
    process.env.ARBITRUM_RPC_URL ||
    'https://arbitrum.rpc.subquery.network/public',
  bsc: process.env.BSC_RPC_URL || 'https://binance.llamarpc.com',
  base: process.env.BASE_RPC_URL || 'https://base.llamarpc.com',
  optimism:
    process.env.OPTIMISM_RPC_URL ||
    'https://optimism.rpc.subquery.network/public',
  1:
    process.env.ETHEREUM_RPC_URL ||
    'https://ethereum.rpc.subquery.network/public',
  42161:
    process.env.ARBITRUM_RPC_URL ||
    'https://arbitrum.rpc.subquery.network/public',
  56: process.env.BSC_RPC_URL || 'https://binance.llamarpc.com',
  8453: process.env.BASE_RPC_URL || 'https://base.llamarpc.com',
  10:
    process.env.OPTIMISM_RPC_URL ||
    'https://optimism.rpc.subquery.network/public',
};

const TESTNET_RPC_URLS = {
  sepolia:
    process.env.SEPOLIA_RPC_URL || 'https://gateway.tenderly.co/public/sepolia',
  arbitrumSepolia:
    process.env.ARBITRUM_SEPOLIA_RPC_URL ||
    'https://arbitrum-sepolia-rpc.publicnode.com',
  bscTestnet:
    process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com',
  baseSepolia:
    process.env.BASE_SEPOLIA_RPC_URL ||
    'https://base-sepolia.gateway.tenderly.co',
  optimismSepolia:
    process.env.OPTIMISM_SEPOLIA_RPC_URL ||
    'https://optimism-sepolia.gateway.tenderly.co',
  // Chain ID mappings
  11155111:
    process.env.SEPOLIA_RPC_URL || 'https://gateway.tenderly.co/public/sepolia',
  421614:
    process.env.ARBITRUM_SEPOLIA_RPC_URL ||
    'https://arbitrum-sepolia-rpc.publicnode.com',
  97:
    process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com',
  84532:
    process.env.BASE_SEPOLIA_RPC_URL ||
    'https://base-sepolia.gateway.tenderly.co',
  11155420:
    process.env.OPTIMISM_SEPOLIA_RPC_URL ||
    'https://optimism-sepolia.gateway.tenderly.co',
};

export const RPC_URLS = {
  production: MAINNET_RPC_URLS,
  test: TESTNET_RPC_URLS,
  local_test: {
    // Support both mainnet and testnet RPC URLs
    ...MAINNET_RPC_URLS,
    ...TESTNET_RPC_URLS,
  },
  local: {
    // Support both mainnet and testnet RPC URLs
    ...MAINNET_RPC_URLS,
    ...TESTNET_RPC_URLS,
  },
};

export const getNetworkConfig = (mode: AppMode) => {
  return {
    networks: NETWORKS[mode],
    rpcUrls: RPC_URLS[mode],
  };
};

export const getChainId = (networkName: string, mode: AppMode) => {
  const networks = NETWORKS[mode];
  const chain = networks[networkName as keyof typeof networks] as any;
  return chain?.id;
};

export const getRpcUrl = (network: string | number, mode: AppMode) => {
  const rpcUrls = RPC_URLS[mode];
  return rpcUrls[network as keyof typeof rpcUrls];
};

export const REFETCH_GAS_INTERVAL: Record<number, number> = {
  1: 4000,
  42161: 4000,
  56: 4000,
  8453: 4000,
  10: 4000,
  11155111: 4000,
  421614: 4000,
  97: 4000,
  84532: 4000,
  11155420: 4000,
};
