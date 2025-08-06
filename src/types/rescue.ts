export interface GasPayment {
  id: string;
  compromised_address: string;
  gas_transaction_hash: string;
  eth_paid: string; // ETH value paid
  chain_id: number;
  block_number: number;
  created_at: string;
}

export interface RescueTransaction {
  id: string;
  compromised_address: string;
  receiver_address: string;
  tokens: string[];
  gas_transaction_hash: string;
  rescue_transaction_hash: string;
  gas_used: string; // Gas units used
  eth_used: string; // ETH value used for gas
  chain_id: number;
  deadline: number;
  created_at: string;
  status: 'pending' | 'success' | 'failed';
}

export interface RescueRequest {
  authorization: string; // RSV format authorization
  eip712Signature: string;
  tokens: string[];
  deadline: number;
  receiverWallet: string;
  gasTransactionHash?: string;
  compromisedAddress: string;
  chainId: number;
  nonce: number; // Nonce for the authorization
}

export interface GasSummary {
  compromised_address: string;
  total_eth_paid: string; // Total ETH paid for gas
  total_eth_used: string; // Total ETH used for gas
  remaining_eth: string; // Remaining ETH balance
}

export interface GasTransactionData {
  compromised_address: string;
  gas_transaction_hash: string;
  eth_paid: string; // ETH value paid
  chain_id: number;
  block_number: number;
}

export interface LastBlockRecord {
  id: string;
  chain_id: number;
  last_block: number;
  updated_at: string;
}

export interface CustomGasError {
  type: string;
  extraGasEthNeeded: bigint;
  estimatedGasEth: bigint;
  remainingEth: bigint;
}
