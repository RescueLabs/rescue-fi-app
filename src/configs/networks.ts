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

export const NETWORKS = {
  production: {
    ethereum: mainnet,
    arbitrum,
    bsc,
    base,
    optimism,
  },
  test: {
    ethereum: sepolia,
    arbitrum: arbitrumSepolia,
    bsc: bscTestnet,
    base: baseSepolia,
    optimism: optimismSepolia,
  },
};

export const RPC_URLS = {
  production: {
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
  },
  test: {
    ethereum:
      process.env.SEPOLIA_RPC_URL ||
      'https://gateway.tenderly.co/public/sepolia',
    arbitrum:
      process.env.ARBITRUM_SEPOLIA_RPC_URL ||
      'https://arbitrum-sepolia-rpc.publicnode.com',
    bsc:
      process.env.BSC_TESTNET_RPC_URL ||
      'https://bsc-testnet-rpc.publicnode.com',
    base:
      process.env.BASE_SEPOLIA_RPC_URL ||
      'https://base-sepolia.gateway.tenderly.co',
    optimism:
      process.env.OPTIMISM_SEPOLIA_RPC_URL ||
      'https://optimism-sepolia.gateway.tenderly.co',
    11155111:
      process.env.SEPOLIA_RPC_URL ||
      'https://gateway.tenderly.co/public/sepolia',
    421614:
      process.env.ARBITRUM_SEPOLIA_RPC_URL ||
      'https://arbitrum-sepolia-rpc.publicnode.com',
    97:
      process.env.BSC_TESTNET_RPC_URL ||
      'https://bsc-testnet-rpc.publicnode.com',
    84532:
      process.env.BASE_SEPOLIA_RPC_URL ||
      'https://base-sepolia.gateway.tenderly.co',
    11155420:
      process.env.OPTIMISM_SEPOLIA_RPC_URL ||
      'https://optimism-sepolia.gateway.tenderly.co',
  },
};

export const getNetworkConfig = (mode: 'production' | 'test') => {
  return {
    networks: NETWORKS[mode],
    rpcUrls: RPC_URLS[mode],
  };
};

export const getChainId = (
  networkName: string,
  mode: 'production' | 'test',
) => {
  const networks = NETWORKS[mode];
  return networks[networkName as keyof typeof networks]?.id;
};

export const getRpcUrl = (
  network: string | number,
  mode: 'production' | 'test',
) => {
  const rpcUrls = RPC_URLS[mode];
  return rpcUrls[network as keyof typeof rpcUrls];
};
