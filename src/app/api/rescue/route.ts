import { NextRequest, NextResponse } from 'next/server';

import { DatabaseService } from '@/lib/services/database';
import { TransactionService } from '@/lib/services/transactionService';
import { Web3Service, web3Service } from '@/lib/services/web3';
import { EtherscanMutex } from '@/lib/utils/etherscanMutex';
import { RescueMutex } from '@/lib/utils/rescueMutex';

import type { RescueRequest } from '@/lib/types/rescue';

// Global mutex map for each compromised address
const rescueMutexes: Map<string, RescueMutex> = new Map();

// Global mutex map for each chain
const chainMutexes: Map<number, EtherscanMutex> = new Map();

// Get or create mutex for a specific address
function getRescueMutex(address: string): RescueMutex {
  const normalizedAddress = address.toLowerCase();
  let mutex = rescueMutexes.get(normalizedAddress);
  if (!mutex) {
    mutex = new RescueMutex();
    rescueMutexes.set(normalizedAddress, mutex);
  }
  return mutex;
}

// Get or create mutex for a specific chain
function getChainMutex(chainId: number): EtherscanMutex {
  let mutex = chainMutexes.get(chainId);
  if (!mutex) {
    mutex = new EtherscanMutex();
    chainMutexes.set(chainId, mutex);
  }
  return mutex;
}

// Cleanup function to remove unused mutexes
function cleanupUnusedMutexes(): void {
  Array.from(rescueMutexes.entries()).forEach(([address, mutex]) => {
    if (!mutex.isLocked()) {
      const lockDuration = mutex.getLockDuration();
      // Remove mutexes that haven't been used for more than 10 minutes
      if (lockDuration === null || lockDuration > 600000) {
        rescueMutexes.delete(address);
        console.log(`Cleaned up unused mutex for address: ${address}`);
      }
    }
  });
}

// Get mutex statistics for monitoring
function getMutexStats(): {
  totalMutexes: number;
  lockedMutexes: number;
} {
  let lockedCount = 0;

  Array.from(rescueMutexes.values()).forEach((mutex) => {
    if (mutex.isLocked()) {
      lockedCount += 1;
    }
  });

  return {
    totalMutexes: rescueMutexes.size,
    lockedMutexes: lockedCount,
  };
}

// Periodic cleanup - runs every 10 minutes
let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

function maybeRunCleanup(): void {
  const now = Date.now();
  if (now - lastCleanupTime > CLEANUP_INTERVAL) {
    const stats = getMutexStats();
    console.log(
      `Running periodic mutex cleanup. Stats before: ${JSON.stringify(stats)}`,
    );

    cleanupUnusedMutexes();

    const statsAfter = getMutexStats();
    console.log(
      `Mutex cleanup completed. Stats after: ${JSON.stringify(statsAfter)}`,
    );

    lastCleanupTime = now;
  }
}

export async function POST(request: NextRequest) {
  let rescueTransaction: any = null; // Declare at function scope
  let rescueMutex: RescueMutex | null = null;

  // Run periodic cleanup occasionally (1% chance)
  if (Math.random() < 0.01) {
    maybeRunCleanup();
  }

  try {
    const body: RescueRequest = await request.json();

    // Validate required fields
    const {
      authorization,
      eip712Signature,
      tokens,
      deadline,
      receiverWallet,
      gasTransactionHash,
      compromisedAddress,
      chainId,
      nonce,
    } = body;

    if (
      !eip712Signature ||
      !tokens ||
      !deadline ||
      !receiverWallet ||
      !compromisedAddress ||
      !chainId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 },
      );
    }

    // Validate address formats
    if (
      !/^0x[a-fA-F0-9]{40}$/.test(compromisedAddress) ||
      !/^0x[a-fA-F0-9]{40}$/.test(receiverWallet)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid address format',
        },
        { status: 400 },
      );
    }

    // Validate signature formats
    if (
      !/^0x[a-fA-F0-9]{130}$/.test(eip712Signature) ||
      (authorization && !/^0x[a-fA-F0-9]{130}$/.test(authorization))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid signature format',
        },
        { status: 400 },
      );
    }

    // Validate tokens array
    if (!Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tokens array',
        },
        { status: 400 },
      );
    }

    let invalidToken = false;
    // Validate token addresses
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!/^0x[a-fA-F0-9]{40}$/.test(token)) {
        invalidToken = true;
        break;
      }
    }

    if (invalidToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token address in tokens array',
        },
        { status: 400 },
      );
    }

    // Validate nonce
    if (authorization && (typeof nonce !== 'number' || nonce < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid nonce: must be a non-negative number',
        },
        { status: 400 },
      );
    }

    if (!web3Service.isChainSupported(chainId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chain not supported',
        },
        { status: 400 },
      );
    }

    // Validate compromised address is already delegated
    if (!authorization) {
      const isDelegated = await web3Service.isDelegated(
        compromisedAddress as `0x${string}`,
        chainId,
      );
      if (!isDelegated) {
        return NextResponse.json(
          {
            success: false,
            error: 'Compromised address is not delegated',
          },
          { status: 400 },
        );
      }
    }

    // Acquire mutex for this compromised address
    rescueMutex = getRescueMutex(compromisedAddress);
    const acquired = await rescueMutex.acquire(compromisedAddress);

    if (!acquired) {
      console.warn(
        `Rejected rescue request for address: ${compromisedAddress} due to concurrent operation.`,
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Another rescue operation is in progress for this wallet',
          details:
            'Please wait for the current operation to complete before trying again',
        },
        { status: 429 }, // Too Many Requests
      );
    }

    console.log(`Acquired rescue mutex for address: ${compromisedAddress}`);

    console.log(
      `Processing rescue for address: ${compromisedAddress} on chain:${chainId} ${nonce ? ` with nonce: ${nonce}` : '.'}`,
    );

    // 1. Fetch all gas payments since the last processed block
    // Acquire chain-specific mutex for gas payment processing
    const chainMutex = getChainMutex(chainId);
    await chainMutex.acquire(chainId);

    console.log(`Acquired chain mutex for chain: ${chainId}`);

    let gasPayment;
    try {
      // Get the last processed block for this chain
      const lastBlock = await DatabaseService.getOrCreateLastBlock(chainId);
      const startBlock = lastBlock.last_block + 1;

      // Get current block number to use as endBlock
      const publicClient = web3Service.getPublicClient(chainId);
      const currentBlock = await publicClient.getBlockNumber();
      const endBlock = Number(currentBlock);

      if (startBlock <= endBlock) {
        console.log(
          `Processing gas payments for chain ${chainId} from block ${startBlock} to ${endBlock}`,
        );

        // Fetch gas payment transactions from Etherscan
        const gasPaymentTransactions =
          await TransactionService.getGasPaymentTransactionsWithPagination(
            chainId,
            startBlock,
            endBlock,
          );

        console.log(
          `Found ${gasPaymentTransactions.length} gas payment transactions`,
        );

        // Process each gas payment transaction
        for (let i = 0; i < gasPaymentTransactions.length; i++) {
          const tx = gasPaymentTransactions[i];
          try {
            // Extract gas payment data
            const gasPaymentData = TransactionService.extractGasPaymentData(
              tx,
              chainId,
            );
            if (gasPaymentData) {
              // Check if already recorded
              // eslint-disable-next-line no-await-in-loop
              const exists = await DatabaseService.gasPaymentExists(tx.hash);
              if (!exists) {
                // Record the gas payment
                // eslint-disable-next-line no-await-in-loop
                await DatabaseService.createGasPayment({
                  compromised_address: gasPaymentData.compromised_address,
                  gas_transaction_hash: tx.hash,
                  eth_paid: tx.value,
                  chain_id: chainId,
                  block_number: parseInt(tx.blockNumber, 10),
                });
                console.log(
                  `Recorded gas payment: ${tx.hash} for address: ${gasPaymentData.compromised_address}`,
                );
              }
            }
          } catch (error) {
            console.error(
              `Error processing gas payment transaction ${tx.hash}:`,
              error,
            );
          }
        }

        // Update last processed block
        await DatabaseService.updateLastBlock(chainId, endBlock);
      }
    } catch (error) {
      console.error(`Error updating gas payments for chain ${chainId}:`, error);
    } finally {
      // Release chain mutex
      chainMutex.release();
      console.log(`Released chain mutex for chain: ${chainId}`);
    }

    if (gasTransactionHash) {
      gasPayment =
        await DatabaseService.getGasPaymentByHash(gasTransactionHash);

      // 2. If still not found, fetch the specific transaction directly using public client
      if (!gasPayment) {
        console.log(
          `Gas payment ${gasTransactionHash} still not found. Fetching transaction directly using public client...`,
        );

        try {
          // Get the transaction directly using the public client
          const publicClient = web3Service.getPublicClient(chainId);
          const transaction = await publicClient.getTransaction({
            hash: gasTransactionHash as `0x${string}`,
          });

          if (transaction) {
            // Check if this transaction is to our backend wallet
            const backendAddress =
              process.env.BACKEND_WALLET_ADDRESS?.toLowerCase();
            if (
              backendAddress &&
              transaction.to?.toLowerCase() === backendAddress
            ) {
              // Convert viem transaction to our format
              const etherscanTx = {
                blockNumber: transaction.blockNumber?.toString() || '0',
                timeStamp: '0', // We don't have timestamp from viem
                hash: transaction.hash,
                nonce: transaction.nonce.toString(),
                blockHash: transaction.blockHash || '',
                transactionIndex: '0',
                from: transaction.from,
                to: transaction.to || '',
                value: transaction.value.toString(),
                gas: transaction.gas.toString(),
                gasPrice: transaction.gasPrice?.toString() || '0',
                isError: '0',
                txreceipt_status: '1',
                input: transaction.input,
                contractAddress: '',
                cumulativeGasUsed: '0',
                gasUsed: '0',
                confirmations: '0',
                methodId: transaction.input.slice(0, 10),
                functionName: '',
              };

              // Extract gas payment data
              const gasPaymentData = TransactionService.extractGasPaymentData(
                etherscanTx,
                chainId,
              );
              if (gasPaymentData) {
                // Check if already recorded
                const exists = await DatabaseService.gasPaymentExists(
                  transaction.hash,
                );
                if (!exists) {
                  // Record the gas payment
                  await DatabaseService.createGasPayment({
                    compromised_address: gasPaymentData.compromised_address,
                    gas_transaction_hash: transaction.hash,
                    eth_paid: transaction.value.toString(),
                    chain_id: chainId,
                    block_number: Number(transaction.blockNumber),
                  });
                  console.log(
                    `Recorded gas payment from direct fetch: ${transaction.hash} for address: ${gasPaymentData.compromised_address}`,
                  );
                }
              }

              // Check again after direct fetch
              gasPayment =
                await DatabaseService.getGasPaymentByHash(gasTransactionHash);
            }
          }
        } catch (error) {
          console.error(
            `Error fetching transaction directly using public client:`,
            error,
          );
        }
      }

      // 3. If still not found, return 404
      if (!gasPayment) {
        return NextResponse.json(
          {
            success: false,
            error: 'Gas payment not found',
          },
          { status: 404 },
        );
      }

      // 4. Verify gas payment matches compromised address
      if (
        gasPayment.compromised_address.toLowerCase() !==
        compromisedAddress.toLowerCase()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Gas payment does not match compromised address',
          },
          { status: 400 },
        );
      }
    }

    // 5. Get user details to calculate remaining gas
    const gasSummary = await DatabaseService.getGasSummary(
      compromisedAddress,
      chainId,
    );
    const remainingEth = BigInt(gasSummary.remaining_eth);

    // 6. Estimate gas for rescue transaction
    try {
      let estimatedGasUnits = await web3Service.estimateGasForRescue(
        chainId,
        compromisedAddress as `0x${string}`,
        receiverWallet as `0x${string}`,
        tokens as `0x${string}`[],
        BigInt(deadline),
        eip712Signature as `0x${string}`,
        (authorization as `0x${string}`) || '',
        Number(nonce || 0),
      );

      console.log('estimatedGasUnits', estimatedGasUnits);
      estimatedGasUnits = (estimatedGasUnits * BigInt(110)) / BigInt(100);
      console.log('estimatedGasUnits', estimatedGasUnits);

      // Convert gas units to ETH value using Blocknative's EIP-1559 formula
      const {
        gasInEth: estimatedGasEth,
        maxPriorityFeePerGas,
        maxFeePerGas,
      } = await web3Service.gasToEth(estimatedGasUnits, chainId);

      console.log('estimatedGasEth', estimatedGasEth);
      console.log('remainingEth', remainingEth);
      console.log('maxFeePerGas', maxFeePerGas);
      console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);

      // Check if user has enough gas (in ETH value)
      if (estimatedGasEth > remainingEth) {
        const extraNeeded = estimatedGasEth - remainingEth;
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient gas for rescue transaction',
            extraGasNeeded: Web3Service.formatEther(extraNeeded),
            estimatedGas: Web3Service.formatEther(estimatedGasEth),
            remainingEth: Web3Service.formatEther(remainingEth),
          },
          { status: 400 },
        );
      }

      // 7. Create rescue transaction record with pending status
      rescueTransaction = await DatabaseService.createRescueTransaction({
        compromised_address: compromisedAddress.toLowerCase(),
        receiver_address: receiverWallet.toLowerCase(),
        tokens: tokens.map((t) => t.toLowerCase()),
        gas_transaction_hash: gasTransactionHash || '',
        rescue_transaction_hash: '', // Will be updated after transaction
        gas_used: '0', // Will be updated after transaction
        eth_used: '0', // Will be updated after transaction
        chain_id: chainId,
        deadline,
        status: 'pending',
      });

      // 8. Execute rescue transaction
      const rescueTxHash = await web3Service.sendRescueTransaction(
        chainId,
        compromisedAddress as `0x${string}`,
        receiverWallet as `0x${string}`,
        tokens as `0x${string}`[],
        BigInt(deadline),
        eip712Signature as `0x${string}`,
        (authorization as `0x${string}`) || '',
        Number(nonce || 0),
        estimatedGasUnits,
        maxFeePerGas,
        maxPriorityFeePerGas,
      );

      await DatabaseService.updateRescueTransaction(rescueTransaction.id, {
        rescue_transaction_hash: rescueTxHash,
      });

      // 9. Wait for transaction receipt and get gas used
      const receipt = await web3Service.getTransactionReceipt(
        rescueTxHash,
        chainId,
      );
      const gasUsed = receipt.gasUsed;
      const ethUsed = gasUsed * receipt.effectiveGasPrice;

      // 10. Update rescue transaction with results
      const status = receipt.status === 'success' ? 'success' : 'failed';
      await DatabaseService.updateRescueTransaction(rescueTransaction.id, {
        gas_used: gasUsed.toString(),
        eth_used: ethUsed.toString(),
        status,
      });

      console.log(
        `Rescue completed with status: ${status}. Transaction hash: ${rescueTxHash}`,
      );

      if (status === 'success') {
        return NextResponse.json({
          success: true,
          data: {
            rescueTransactionHash: rescueTxHash,
            gasUsed: Web3Service.formatEther(ethUsed),
            remainingEth: Web3Service.formatEther(remainingEth - ethUsed),
            status: 'success',
          },
        });
      }
      return NextResponse.json({
        success: false,
        error: 'Rescue transaction failed',
        data: {
          rescueTransactionHash: rescueTxHash,
          gasUsed: Web3Service.formatEther(ethUsed),
          remainingEth: Web3Service.formatEther(remainingEth - ethUsed),
          status: 'failed',
        },
      });
    } catch (error) {
      console.error('Error executing rescue transaction:', error);

      // Update rescue transaction as failed if we have a record
      if (rescueTransaction) {
        await DatabaseService.updateRescueTransaction(rescueTransaction.id, {
          status: 'failed',
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to execute rescue transaction',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error processing rescue request:', error);

    // Update rescue transaction as failed if we have a record
    if (rescueTransaction) {
      await DatabaseService.updateRescueTransaction(rescueTransaction.id, {
        status: 'failed',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process rescue request',
      },
      { status: 500 },
    );
  } finally {
    // Release mutex after processing
    if (rescueMutex) {
      const address = rescueMutex.getCurrentAddress();
      rescueMutex.release();
      console.log(`Released rescue mutex for address: ${address || 'unknown'}`);
    }
  }
}
