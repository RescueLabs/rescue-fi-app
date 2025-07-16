import { getNetworkConfig } from '../config/networks';
import { Mutex } from '../utils/mutex';

import { DatabaseService } from './database';
import { web3Service } from './web3';

import type { GasTransactionData } from '../types/rescue';

export class GasPaymentService {
  private chainMutexes: Map<number, Mutex> = new Map();

  async updateGasTransactions(): Promise<{
    processed: number;
    errors: string[];
  }> {
    const { networks } = getNetworkConfig(
      process.env.NODE_ENV === 'production' ? 'production' : 'test',
    );
    const results = {
      processed: 0,
      errors: [] as string[],
    };

    // Process each network using the chain-specific mutexes
    const networkEntries = Object.entries(networks);
    for (let i = 0; i < networkEntries.length; i += 1) {
      const [networkName, chain] = networkEntries[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        const chainResults = await this.updateGasTransactionsForChain(chain.id);
        results.processed += chainResults.processed;
        results.errors.push(...chainResults.errors);
      } catch (error) {
        results.errors.push(`Error processing ${networkName}: ${error}`);
      }
    }

    return results;
  }

  async updateGasTransactionsForChain(chainId: number): Promise<{
    processed: number;
    errors: string[];
  }> {
    // Get or create mutex for this specific chain
    let chainMutex = this.chainMutexes.get(chainId);
    if (!chainMutex) {
      chainMutex = new Mutex();
      this.chainMutexes.set(chainId, chainMutex);
    }

    // Acquire chain-specific mutex
    await chainMutex.acquire();

    try {
      return await GasPaymentService.processChain(chainId);
    } finally {
      chainMutex.release();
    }
  }

  private static async processChain(chainId: number): Promise<{
    processed: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      errors: [] as string[],
    };

    try {
      // Get last processed block
      const lastBlockRecord = await DatabaseService.getLastBlock(chainId);
      const startBlock = lastBlockRecord
        ? BigInt(lastBlockRecord.last_block + 1)
        : BigInt(0);
      const endBlock = await web3Service.getLatestBlockNumber(chainId);

      if (startBlock > endBlock) {
        return results; // No new blocks to process
      }

      // Process blocks in batches to avoid rate limits
      const batchSize = BigInt(100);
      for (
        let blockNumber = startBlock;
        blockNumber <= endBlock;
        blockNumber += batchSize
      ) {
        const batchEnd =
          blockNumber + batchSize - BigInt(1) > endBlock
            ? endBlock
            : blockNumber + batchSize - BigInt(1);

        try {
          // eslint-disable-next-line no-await-in-loop
          const batchResults = await GasPaymentService.processBlockRange(
            chainId,
            blockNumber,
            batchEnd,
          );
          results.processed += batchResults.processed;
          results.errors.push(...batchResults.errors);
        } catch (error) {
          results.errors.push(
            `Error processing blocks ${blockNumber}-${batchEnd}: ${error}`,
          );
        }
      }

      // Update last processed block
      await DatabaseService.updateLastBlock(chainId, Number(endBlock));
    } catch (error) {
      results.errors.push(`Error processing chain ${chainId}: ${error}`);
    }

    return results;
  }

  private static async processBlockRange(
    chainId: number,
    startBlock: bigint,
    endBlock: bigint,
  ): Promise<{
    processed: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      errors: [] as string[],
    };

    const publicClient = web3Service.getPublicClient(chainId);
    const backendAddress = process.env.BACKEND_WALLET_ADDRESS?.toLowerCase();

    if (!backendAddress) {
      results.errors.push('Backend wallet address not configured');
      return results;
    }

    for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
      try {
        // Get block with full transaction details
        // eslint-disable-next-line no-await-in-loop
        const block = await publicClient.getBlock({
          blockNumber,
          includeTransactions: true,
        });

        // eslint-disable-next-line no-continue
        if (!block.transactions) continue;

        // Process transactions efficiently
        for (let i = 0; i < block.transactions.length; i += 1) {
          const tx = block.transactions[i];
          let transaction: any;

          // Handle both transaction objects and hashes
          if (typeof tx === 'string') {
            // Fetch transaction by hash
            try {
              // eslint-disable-next-line no-await-in-loop
              transaction = await web3Service.getTransaction(
                tx as `0x${string}`,
                chainId,
              );
              // eslint-disable-next-line no-continue
              if (!transaction) continue;
            } catch (error) {
              results.errors.push(`Error fetching transaction ${tx}: ${error}`);
              // eslint-disable-next-line no-continue
              continue;
            }
          } else {
            // Transaction is already a full object
            transaction = tx;
          }

          // Quick filter: check if transaction is sent to backend wallet
          if (transaction.to?.toLowerCase() !== backendAddress) {
            // eslint-disable-next-line no-continue
            continue;
          }

          // Check if this is a valid gas payment transaction
          const gasPaymentData =
            GasPaymentService.extractGasPaymentData(transaction);
          if (gasPaymentData) {
            try {
              // Check if already recorded
              // eslint-disable-next-line no-await-in-loop
              const exists = await DatabaseService.gasPaymentExists(
                transaction.hash,
              );
              if (!exists) {
                // Record the gas payment with transaction data
                // eslint-disable-next-line no-await-in-loop
                await DatabaseService.createGasPayment({
                  compromised_address: gasPaymentData.compromised_address,
                  gas_transaction_hash: transaction.hash,
                  eth_paid: transaction.value.toString(),
                  chain_id: chainId,
                  block_number: Number(blockNumber),
                });
                results.processed += 1;
              }
            } catch (error) {
              results.errors.push(
                `Error recording gas payment ${transaction.hash}: ${error}`,
              );
            }
          }
        }
      } catch (error) {
        results.errors.push(`Error processing block ${blockNumber}: ${error}`);
      }
    }

    return results;
  }

  private static extractGasPaymentData(tx: any): GasTransactionData | null {
    // Check if transaction is to our backend wallet
    const backendAddress = process.env.BACKEND_WALLET_ADDRESS?.toLowerCase();
    if (!backendAddress || tx.to?.toLowerCase() !== backendAddress) {
      return null;
    }

    // Check if transaction has data (address of compromised wallet)
    if (!tx.data || tx.data === '0x') {
      return null;
    }

    // Extract address from transaction data
    // The data should be exactly 42 characters (0x + 20 bytes address)
    const addressData = tx.data.slice(2); // Remove '0x' prefix
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
      eth_paid: tx.value.toString(),
      chain_id: 0, // Will be set by caller
      block_number: 0, // Will be set by caller
    };
  }
}

export const gasPaymentService = new GasPaymentService();
