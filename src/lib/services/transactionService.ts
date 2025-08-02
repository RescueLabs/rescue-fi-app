import axios from 'axios';

import { GasTransactionData } from '../../types/rescue';

interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export class TransactionService {
  private static getEtherscanUrl(): string {
    // Use the universal Etherscan API v2 endpoint
    return 'https://api.etherscan.io/v2/api';
  }

  private static getApiKey(): string {
    return process.env.ETHERSCAN_API_KEY || '';
  }

  /**
   * Get all transactions sent TO an address using Etherscan API
   * Much faster than RPC calls for historical data
   */
  static async getTransactionsToAddress(
    address: string,
    chainId: number,
    startBlock: number = 0,
    endBlock: number = 99999999,
    page: number = 1,
    offset: number = 1000,
  ): Promise<EtherscanTransaction[]> {
    const etherscanUrl = this.getEtherscanUrl();
    const apiKey = this.getApiKey();

    try {
      // Use the universal Etherscan API format
      const response = await axios.get<EtherscanResponse>(etherscanUrl, {
        params: {
          chainid: chainId,
          module: 'account',
          action: 'txlist',
          address: address.toLowerCase(),
          startblock: startBlock,
          endblock: endBlock,
          page,
          offset,
          sort: 'asc', // Ascending order to process from oldest to newest
          apikey: apiKey,
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data.status === '1') {
        // Filter to only include transactions where the address is the recipient
        return response.data.result.filter(
          (tx) => tx.to.toLowerCase() === address.toLowerCase(),
        );
      }
      throw new Error(`Etherscan API error: ${response.data.message}`);
    } catch (error) {
      console.error(
        `Error fetching transactions for address ${address} on chain ${chainId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get gas payment transactions sent TO the backend address using universal Etherscan API
   * Filters for transactions that contain an address in the data field
   */
  static async getGasPaymentTransactions(
    chainId: number,
    startBlock: number = 0,
    endBlock: number = 99999999,
    page: number = 1,
    offset: number = 1000,
  ): Promise<EtherscanTransaction[]> {
    const backendAddress = process.env.BACKEND_WALLET_ADDRESS?.toLowerCase();
    if (!backendAddress) {
      throw new Error('Backend wallet address not configured');
    }

    const etherscanUrl = this.getEtherscanUrl();
    const apiKey = this.getApiKey();

    try {
      // Use the universal Etherscan API format
      const response = await axios.get<EtherscanResponse>(etherscanUrl, {
        params: {
          chainid: chainId,
          module: 'account',
          action: 'txlist',
          address: backendAddress,
          startblock: startBlock,
          endblock: endBlock,
          page,
          offset,
          sort: 'asc', // Ascending order to process from oldest to newest
          apikey: apiKey,
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data.status === '1') {
        // Filter for gas payment transactions (those with address in data field)
        return response.data.result.filter((tx) => {
          // Check if transaction is sent TO the backend address
          if (tx.to.toLowerCase() !== backendAddress) {
            return false;
          }

          // Check if transaction has data (address of compromised wallet)
          if (!tx.input || tx.input === '0x') {
            return false;
          }

          // Extract address from transaction data
          // The data should be exactly 42 characters (0x + 20 bytes address)
          const addressData = tx.input.slice(2); // Remove '0x' prefix
          if (addressData.length !== 40) {
            return false; // Not a valid address length
          }

          // The entire data after removing 0x should be the address
          const compromisedAddress = `0x${addressData}`;

          // Validate address format
          if (!/^0x[a-fA-F0-9]{40}$/.test(compromisedAddress)) {
            return false;
          }

          return true;
        });
      }
      throw new Error(`Etherscan API error: ${response.data.message}`);
    } catch (error) {
      console.error(
        `Error fetching gas payment transactions for chain ${chainId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get all transactions sent TO an address using Etherscan API with proper pagination
   * Implements the Etherscan V2 pagination guide to avoid missing transactions
   */
  // eslint-disable-next-line no-await-in-loop
  static async getTransactionsToAddressWithPagination(
    address: string,
    chainId: number,
    startBlock: number = 0,
    endBlock: number = 99999999,
  ): Promise<EtherscanTransaction[]> {
    const allTransactions: EtherscanTransaction[] = [];
    let currentStartBlock = startBlock;
    const pageSize = 1000; // Etherscan's maximum page size

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        console.log(
          `Fetching transactions for ${address} on chain ${chainId} from block ${currentStartBlock} to ${endBlock} (page ${Math.floor(allTransactions.length / pageSize) + 1})`,
        );

        // eslint-disable-next-line no-await-in-loop
        const transactions = await this.getTransactionsToAddress(
          address,
          chainId,
          currentStartBlock,
          endBlock,
          1, // Always use page 1 since we're manually paginating
          pageSize,
        );

        if (transactions.length === 0) {
          console.log('No more transactions found, stopping pagination');
          break;
        }

        allTransactions.push(...transactions);

        // Get the block number of the last record
        const lastTransaction = transactions[transactions.length - 1];
        const lastBlockNumber = parseInt(lastTransaction.blockNumber, 10);

        // Set the next startBlock to the block number of the last record - 1
        // This ensures we don't miss any transactions
        currentStartBlock = lastBlockNumber - 1;

        console.log(
          `Fetched ${transactions.length} transactions. Last block: ${lastBlockNumber}. Next start block: ${currentStartBlock}`,
        );

        // If we've reached the end block, stop
        if (lastBlockNumber >= endBlock) {
          console.log('Reached end block, stopping pagination');
          break;
        }

        // If we received fewer than pageSize results, we've reached the end
        if (transactions.length < pageSize) {
          console.log(
            `Received ${transactions.length} transactions (less than ${pageSize}), stopping pagination`,
          );
          break;
        }

        // Add a small delay to respect rate limits
        setTimeout(() => {
          // Rate limiting delay
        }, 100);
      } catch (error) {
        console.error(
          `Error during pagination for address ${address} on chain ${chainId}:`,
          error,
        );
        throw error;
      }
    }

    console.log(
      `Total transactions fetched for ${address} on chain ${chainId}: ${allTransactions.length}`,
    );

    return allTransactions;
  }

  /**
   * Get gas payment transactions with proper pagination
   * Implements the Etherscan V2 pagination guide to avoid missing transactions
   */
  // eslint-disable-next-line no-await-in-loop
  static async getGasPaymentTransactionsWithPagination(
    chainId: number,
    startBlock: number = 0,
    endBlock: number = 99999999,
  ): Promise<EtherscanTransaction[]> {
    const backendAddress = process.env.BACKEND_WALLET_ADDRESS?.toLowerCase();
    if (!backendAddress) {
      throw new Error('Backend wallet address not configured');
    }

    const allTransactions: EtherscanTransaction[] = [];
    let currentStartBlock = startBlock;
    const pageSize = 1000; // Etherscan's maximum page size

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        console.log(
          `Fetching gas payment transactions for chain ${chainId} from block ${currentStartBlock} to ${endBlock} (page ${Math.floor(allTransactions.length / pageSize) + 1})`,
        );

        // eslint-disable-next-line no-await-in-loop
        const transactions = await this.getGasPaymentTransactions(
          chainId,
          currentStartBlock,
          endBlock,
          1, // Always use page 1 since we're manually paginating
          pageSize,
        );

        if (transactions.length === 0) {
          console.log(
            'No more gas payment transactions found, stopping pagination',
          );
          break;
        }

        allTransactions.push(...transactions);

        // Get the block number of the last record
        const lastTransaction = transactions[transactions.length - 1];
        const lastBlockNumber = parseInt(lastTransaction.blockNumber, 10);

        // Set the next startBlock to the block number of the last record - 1
        // This ensures we don't miss any transactions
        currentStartBlock = lastBlockNumber - 1;

        console.log(
          `Fetched ${transactions.length} gas payment transactions. Last block: ${lastBlockNumber}. Next start block: ${currentStartBlock}`,
        );

        // If we've reached the end block, stop
        if (lastBlockNumber >= endBlock) {
          console.log('Reached end block, stopping pagination');
          break;
        }

        // If we received fewer than pageSize results, we've reached the end
        if (transactions.length < pageSize) {
          console.log(
            `Received ${transactions.length} gas payment transactions (less than ${pageSize}), stopping pagination`,
          );
          break;
        }

        // Add a small delay to respect rate limits
        setTimeout(() => {
          // Rate limiting delay
        }, 100);
      } catch (error) {
        console.error(
          `Error during gas payment pagination for chain ${chainId}:`,
          error,
        );
        throw error;
      }
    }

    console.log(
      `Total gas payment transactions fetched for chain ${chainId}: ${allTransactions.length}`,
    );

    return allTransactions;
  }

  /**
   * Extract gas payment data from Etherscan transaction
   */
  static extractGasPaymentData(
    tx: EtherscanTransaction,
    chainId: number,
  ): GasTransactionData | null {
    // Check if transaction is to our backend wallet
    const backendAddress = process.env.BACKEND_WALLET_ADDRESS?.toLowerCase();
    if (!backendAddress || tx.to.toLowerCase() !== backendAddress) {
      return null;
    }

    // Check if transaction has data (address of compromised wallet)
    if (!tx.input || tx.input === '0x') {
      return null;
    }

    // Extract address from transaction data
    // The data should be exactly 42 characters (0x + 20 bytes address)
    const addressData = tx.input.slice(2); // Remove '0x' prefix
    if (addressData.length !== 40) {
      return null; // Not a valid address length
    }

    // The entire data after removing 0x should be the address
    const compromisedAddress = `0x${addressData}`;

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(compromisedAddress)) {
      return null;
    }

    return {
      compromised_address: compromisedAddress.toLowerCase(),
      gas_transaction_hash: tx.hash,
      eth_paid: tx.value,
      chain_id: chainId,
      block_number: parseInt(tx.blockNumber, 10),
    };
  }

  /**
   * Filter transactions by specific criteria
   */
  static filterTransactions(
    transactions: EtherscanTransaction[],
    filters: {
      minValue?: string;
      maxValue?: string;
      methodId?: string;
      status?: 'success' | 'failed';
      fromBlock?: number;
      toBlock?: number;
    },
  ): EtherscanTransaction[] {
    return transactions.filter((tx) => {
      // Filter by value
      if (filters.minValue && BigInt(tx.value) < BigInt(filters.minValue))
        return false;
      if (filters.maxValue && BigInt(tx.value) > BigInt(filters.maxValue))
        return false;

      // Filter by method ID
      if (filters.methodId && tx.methodId !== filters.methodId) return false;

      // Filter by status
      if (filters.status === 'success' && tx.isError === '1') return false;
      if (filters.status === 'failed' && tx.isError === '0') return false;

      // Filter by block range
      if (filters.fromBlock && parseInt(tx.blockNumber, 10) < filters.fromBlock)
        return false;
      if (filters.toBlock && parseInt(tx.blockNumber, 10) > filters.toBlock)
        return false;

      return true;
    });
  }
}
