import { Network } from 'alchemy-sdk';

export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
export const ALCHEMY_NETWORKS = {
  1: Network.ETH_MAINNET,
  11155111: Network.ETH_SEPOLIA,
  42161: Network.ARB_MAINNET,
  421614: Network.ARB_SEPOLIA,
  56: Network.BNB_MAINNET,
  97: Network.BNB_TESTNET,
  8453: Network.BASE_MAINNET,
  84532: Network.BASE_SEPOLIA,
  10: Network.OPT_MAINNET,
  11155420: Network.OPT_SEPOLIA,
};
export const ALCHEMY_BASE_SETTINGS = {
  apiKey: ALCHEMY_API_KEY,
  connectionInfoOverrides: {
    skipFetchSetup: true,
  },
};
