import { Interface } from 'ethers';
import { sepolia, mainnet } from 'viem/chains';

import {
  getSepoliaMevShareClient,
  getEthereumMevShareClient,
} from '../flashbots';

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK;

// Seplia: 11155111
// Mainnet: 1
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

export const FLASHBOTS_RPC_URLS = {
  1: 'https://rpc.flashbots.net/fast',
  11155111: 'https://rpc-sepolia.flashbots.net/',
};

export const RELAY_URLS = {
  1: 'https://relay.flashbots.net',
  11155111: 'https://relay-sepolia.flashbots.net',
};
export const AVG_SEPOLIA_BLOCK_TIME = 13;
export const MAX_BLOCK_NUMBER = 24;
export const SEPOLIA_CHAIN_ID = 11155111;
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const MEV_AUTH_SIGNER_PRIVATE_KEY = process.env
  .MEV_AUTH_SIGNER_PRIVATE_KEY as `0x${string}`;

export const ETHERSCAN_URLS = {
  1: 'https://api.etherscan.io',
  11155111: 'https://api-sepolia.etherscan.io',
};
export const ACCEPTED_CHAIN = {
  1: mainnet,
  11155111: sepolia,
};
export const MEV_CLIENT = {
  1: getEthereumMevShareClient(MEV_AUTH_SIGNER_PRIVATE_KEY, RPC_URLS[1]),
  11155111: getSepoliaMevShareClient(
    MEV_AUTH_SIGNER_PRIVATE_KEY,
    RPC_URLS[11155111],
  ),
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
  victimAddress: 'rescuefi-victimAddress',
  receiverAddress: 'rescuefi-receiverAddress',
  funderAddress: 'rescuefi-funderAddress',
  selectedTokens: 'rescuefi-selectedTokens',
  bundleId: 'rescuefi-bundleId',
};
