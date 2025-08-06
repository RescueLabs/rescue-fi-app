import { Interface } from 'ethers';
import { sepolia, mainnet, Chain } from 'viem/chains';

import { getMode } from '@/configs/app';
import { NETWORKS } from '@/configs/networks';

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK;

export const CHAIN_IDS = {
  mainnet: 1,
  sepolia: 11155111,
};

export const CHAIN_ID = CHAIN_IDS[NETWORK as keyof typeof CHAIN_IDS] as
  | 1
  | 11155111;

export const RPC_URLS = {
  1: 'https://ethereum-rpc.publicnode.com',
  11155111: 'https://ethereum-sepolia-rpc.publicnode.com',
};

export const AVG_SEPOLIA_BLOCK_TIME = 13;
export const MAX_BLOCK_NUMBER = 24;
export const SEPOLIA_CHAIN_ID = 11155111;
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ETHERSCAN_URLS = {
  1: 'https://api.etherscan.io',
  11155111: 'https://api-sepolia.etherscan.io',
};
export const ACCEPTED_CHAIN = {
  1: mainnet,
  11155111: sepolia,
};

export const ERC20_INTERFACE = new Interface([
  'function transfer(address to, uint256 value) public returns (bool)',
]);

// Test values
export const SEPOLIA_AIRDROP_CONTRACT_ADDRESS =
  '0x36084b0f5a72A2AF7A89aC58309Ab2533c85cEdB';
export const ETHEREUM_AIRDROP_CONTRACT_ADDRESS = '';

export const SEPOLIA_AIRDROP_DATA =
  '0x268b15ed0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000f7765696f3b6a6977656a61693b65770000000000000000000000000000000000';
export const ETHEREUM_AIRDROP_DATA =
  '0x268b15ed0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000f7765696f3b6a6977656a61693b65770000000000000000000000000000000000';

export const SEPOLIA_TOKEN_ADDRESS =
  '0xBd1899694F09EbcF2a1F3bB2DB74E570d894FC5d';
export const ETHEREUM_TOKEN_ADDRESS = '';

export const SEPOLIA_RECEIVER_ADDRESS =
  '0xd8Ee094FeB76A51dFE00e08Fbb1206c8b4B54D8E';
export const ETHEREUM_RECEIVER_ADDRESS = '';

export const STORAGE_KEYS = {
  // general
  victimPrivateKey: 'rescuefi-victimPrivateKey',
  victimAddress: 'rescuefi-victimAddress',
  receiverAddress: 'rescuefi-receiverAddress',
  funderAddress: 'rescuefi-funderAddress',
  selectedTokens: 'rescuefi-selectedTokens',

  gasFeeAmount: 'rescuefi-gasFeeAmount',
  authorizationSignature: 'rescuefi-authorizationSignature',
  eip712Signature: 'rescuefi-eip712Signature',
  selectedChainId: 'rescuefi-selectedChainId',

  // airdrop
  airdropContractAddress: 'rescuefi-airdropContractAddress',
  airdropCallData: 'rescuefi-airdropCallData',
};

export const QUERY_KEYS = {
  rescueTokens: 'rescue-tokens',
  estimateGas: 'estimate-gas',
  delegatedDetails: 'delegated-details',
};

export const BACKEND_WALLET_ADDRESS =
  '0x0000000000000000000000000000000000000000';

export const CHAINS: Chain[] = Object.values(NETWORKS[getMode()]);

export const ACCEPTED_CHAIN_MAP = new Set(CHAINS.map((chain) => chain.id));

export const BLOCKSCAN_URLS = {
  1: 'https://etherscan.io/tx',
  11155111: 'https://sepolia.etherscan.io/tx',
  42161: 'https://arbiscan.io/tx',
  421614: 'https://sepolia.arbiscan.io/tx',
  56: 'https://bscscan.com/tx',
  97: 'https://testnet.bscscan.com/tx',
  8453: 'https://basescan.org/tx',
  84532: 'https://sepolia.basescan.org/tx',
  10: 'https://optimistic.etherscan.io/tx',
  11155420: 'https://sepolia-optimism.etherscan.io/tx',
};

export const SUPPORT_US_CHAINS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x742d35Cc6634C0532925a3b8D5c1c9c0b4c4c4c4',
  },
  {
    id: 'bsc',
    name: 'BSC',
    symbol: 'BNB',
    address: '0x742d35Cc6634C0532925a3b8D5c1c9c0b4c4c4c4',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    address: '0x742d35Cc6634C0532925a3b8D5c1c9c0b4c4c4c4',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    address: '0x742d35Cc6634C0532925a3b8D5c1c9c0b4c4c4c4',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    address: '0x742d35Cc6634C0532925a3b8D5c1c9c0b4c4c4c4',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  },
];
