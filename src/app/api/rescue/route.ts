import { NextRequest, NextResponse } from 'next/server';

import { DatabaseService } from '@/lib/services/database';
import { gasPaymentService } from '@/lib/services/gasPaymentService';
import { Web3Service, web3Service } from '@/lib/services/web3';

import type { RescueRequest } from '@/lib/types/rescue';

// Mutex implementation for rescue operations
class RescueMutex {
  private locked = false;

  private currentAddress: string | null = null;

  private lockTime: number | null = null;

  private readonly TIMEOUT_MS = 300000; // 5 minutes timeout

  async acquire(address: string): Promise<boolean> {
    // Check for timeout on existing lock
    if (this.locked && this.lockTime) {
      const elapsed = Date.now() - this.lockTime;
      if (elapsed > this.TIMEOUT_MS) {
        console.warn(
          `Mutex timeout detected for address: ${address}, forcing release`,
        );
        this.forceRelease();
      }
    }

    if (!this.locked) {
      this.locked = true;
      this.currentAddress = address;
      this.lockTime = Date.now();
      return true;
    }
    // Return false if already locked (no queuing)
    return false;
  }

  release(): void {
    this.locked = false;
    this.currentAddress = null;
    this.lockTime = null;
  }

  forceRelease(): void {
    this.locked = false;
    this.currentAddress = null;
    this.lockTime = null;
  }

  getCurrentAddress(): string | null {
    return this.currentAddress;
  }

  isLocked(): boolean {
    return this.locked;
  }

  getLockDuration(): number | null {
    if (this.locked && this.lockTime) {
      return Date.now() - this.lockTime;
    }
    return null;
  }
}

// Global mutex map for each compromised address
const rescueMutexes: Map<string, RescueMutex> = new Map();

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
      !authorization ||
      !eip712Signature ||
      !tokens ||
      !deadline ||
      !receiverWallet ||
      !gasTransactionHash ||
      !compromisedAddress ||
      !chainId ||
      nonce === undefined
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
    if (typeof nonce !== 'number' || nonce < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid nonce: must be a non-negative number',
        },
        { status: 400 },
      );
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
      `Processing rescue for address: ${compromisedAddress} on chain: ${chainId} with nonce: ${nonce}`,
    );

    // 1. First check if gas payment exists in database
    let gasPayment =
      await DatabaseService.getGasPaymentByHash(gasTransactionHash);

    // 2. If not found, update gas payments for this specific chain and check again
    if (!gasPayment) {
      console.log(
        `Gas payment ${gasTransactionHash} not found in database. Updating gas payments for chain ${chainId}...`,
      );

      try {
        const updateResults =
          await gasPaymentService.updateGasTransactionsForChain(chainId);
        console.log(
          `Updated ${updateResults.processed} gas payments for chain ${chainId}`,
        );

        // Check again after updating
        gasPayment =
          await DatabaseService.getGasPaymentByHash(gasTransactionHash);
      } catch (error) {
        console.error(
          `Error updating gas payments for chain ${chainId}:`,
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

    // 5. Get user details to calculate remaining gas
    const userDetails =
      await DatabaseService.getUserDetails(compromisedAddress);
    const remainingEth = BigInt(userDetails.remaining_eth);

    // 6. Estimate gas for rescue transaction
    try {
      let estimatedGasUnits = await web3Service.estimateGasForRescue(
        chainId,
        compromisedAddress as `0x${string}`,
        receiverWallet as `0x${string}`,
        tokens as `0x${string}`[],
        BigInt(deadline),
        eip712Signature as `0x${string}`,
        authorization as `0x${string}`,
        Number(nonce),
      );

      estimatedGasUnits *= BigInt(1.1);

      // Convert gas units to ETH value
      const { gasInEth: estimatedGasEth, priorityFee: maxPriorityFeePerGas } =
        await web3Service.gasToEth(estimatedGasUnits, chainId);

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

      const maxFeePerGas = remainingEth / estimatedGasUnits;

      // 7. Create rescue transaction record with pending status
      rescueTransaction = await DatabaseService.createRescueTransaction({
        compromised_address: compromisedAddress.toLowerCase(),
        receiver_address: receiverWallet.toLowerCase(),
        tokens: tokens.map((t) => t.toLowerCase()),
        gas_transaction_hash: gasTransactionHash,
        rescue_transaction_hash: '', // Will be updated after transaction
        gas_used: '0', // Will be updated after transaction
        eth_used: '0', // Will be updated after transaction
        chain_id: chainId,
        deadline,
        rescue_count: userDetails.rescue_count + 1,
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
        authorization as `0x${string}`,
        Number(nonce),
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
    } finally {
      // Release mutex after processing
      if (rescueMutex) {
        const address = rescueMutex.getCurrentAddress();
        rescueMutex.release();
        console.log(
          `Released rescue mutex for address: ${address || 'unknown'}`,
        );
      }
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
    // Release mutex after processing (in case of early errors)
    if (rescueMutex) {
      const address = rescueMutex.getCurrentAddress();
      rescueMutex.release();
      console.log(
        `Released rescue mutex for address: ${address || 'unknown'} (early error case)`,
      );
    }
  }
}
