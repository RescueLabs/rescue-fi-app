import { Interface } from 'ethers';

import {
  getSepoliaMevShareClient,
  getEthereumMevShareClient,
} from '../flashbots';

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK;

export const RPC_URL =
  NETWORK === 'sepolia'
    ? 'https://ethereum-sepolia-rpc.publicnode.com'
    : 'https://ethereum-rpc.publicnode.com';
export const RELAY_URL =
  NETWORK === 'sepolia'
    ? 'https://relay-sepolia.flashbots.net'
    : 'https://relay.flashbots.net';
export const AVG_SEPOLIA_BLOCK_TIME = 13;
export const MAX_BLOCK_NUMBER = 24;
export const SEPOLIA_CHAIN_ID = 11155111;
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const MEV_AUTH_SIGNER_PRIVATE_KEY = process.env
  .MEV_AUTH_SIGNER_PRIVATE_KEY as `0x${string}`;

export const BASE_ETHERSCAN_URL =
  NETWORK === 'sepolia'
    ? 'https://api-sepolia.etherscan.io'
    : 'https://api.etherscan.io';
export const CHAIN_ID = NETWORK === 'sepolia' ? SEPOLIA_CHAIN_ID : 1;
export const MEV_CLIENT =
  NETWORK === 'sepolia'
    ? getSepoliaMevShareClient(MEV_AUTH_SIGNER_PRIVATE_KEY, RPC_URL)
    : getEthereumMevShareClient(MEV_AUTH_SIGNER_PRIVATE_KEY, RPC_URL);

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
