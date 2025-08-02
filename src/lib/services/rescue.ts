import { GasSummary } from '@/types/rescue';

import { BalanceService } from './balanceService';
import { DatabaseService } from './database';
import { web3Service } from './web3';

export class RescueService {
  static async localRescue(
    chainId: number,
    compromisedAddress: `0x${string}`,
    receiverWallet: `0x${string}`,
    tokens: `0x${string}`[],
    deadline: string,
    eip712Signature: `0x${string}`,
    authorization: `0x${string}`,
    nonce: number,
  ) {
    // Local mode: Skip database operations and check backend wallet balance directly
    console.log('Running in local mode - skipping database operations');

    // Estimate gas for rescue transaction
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
    console.log('estimatedGasUnits with buffer', estimatedGasUnits);

    // Convert gas units to ETH value using Blocknative's EIP-1559 formula
    const {
      gasInEth: estimatedGasEth,
      maxPriorityFeePerGas,
      baseFee,
    } = await web3Service.gasToEth(estimatedGasUnits, chainId);

    // Check backend wallet balance
    const balanceCheck = await BalanceService.checkBackendWalletBalance(
      chainId,
      (baseFee + maxPriorityFeePerGas) * estimatedGasUnits,
    );

    // We calculate maxFeePerGas based on remaining Eth balance and
    // ensure the calculated maxFeePerGas is greater than baseFee + maxPriorityFeePerGas
    // with the checkBackendWalletBalance call above.
    // Check the corresponding comment indatabaseRescue for more details.
    const maxFeePerGas = balanceCheck.currentBalance / estimatedGasUnits;

    console.log('estimatedGasEth', estimatedGasEth);
    console.log('maxFeePerGas', maxFeePerGas);
    console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);
    console.log('baseFee', baseFee);

    if (!balanceCheck.hasEnoughBalance) {
      const error = new Error(
        'Insufficient backend wallet balance for rescue transaction',
        {
          cause: {
            type: 'insufficient_gas',
            extraGasEthNeeded: balanceCheck.deficit,
            estimatedGasEth,
            remainingEth: balanceCheck.currentBalance,
          },
        },
      );

      throw error;
    }

    // Execute rescue transaction directly
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

    // Wait for transaction receipt and get gas used
    const receipt = await web3Service.getTransactionReceipt(
      rescueTxHash,
      chainId,
    );
    const gasUsed = receipt.gasUsed;
    const ethUsed = gasUsed * receipt.effectiveGasPrice;
    const status = receipt.status === 'success' ? 'success' : 'failed';

    console.log(
      `Local mode rescue completed with status: ${status}. Transaction hash: ${rescueTxHash}`,
    );

    return {
      rescueTxHash,
      ethUsed,
      status,
    };
  }

  static async databaseRescue(
    chainId: number,
    compromisedAddress: `0x${string}`,
    receiverWallet: `0x${string}`,
    tokens: `0x${string}`[],
    deadline: string,
    eip712Signature: `0x${string}`,
    authorization: `0x${string}`,
    nonce: number,
    gasSummary: GasSummary,
    gasTransactionHash: string,
  ): Promise<{
    rescueTxHash: string;
    ethUsed: bigint;
    status: string;
    rescueTransaction: any;
  }> {
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
    // Add 10% buffer to estimated gas units
    estimatedGasUnits = (estimatedGasUnits * BigInt(110)) / BigInt(100);

    // Convert gas units to ETH value using Blocknative's EIP-1559 formula
    const {
      gasInEth: estimatedGasEth,
      maxPriorityFeePerGas,
      baseFee,
    } = await web3Service.gasToEth(estimatedGasUnits, chainId);

    // The maxFeePerGas is determined by the address' remaining Eth balance
    // The calcuation here does not make use of maxFeePerGas from the web3Service.gasToEth
    // because the maxFeePerGas is dependent on 2x baseFee which is used when gas estimation is sent to the frontend.
    // But the baseFee may have changed when execution gets here.
    // To prevent a scenario wheere the baseFee goes up and the user has to pay more for the transaction to go through,
    // we calculate the maxFeePerGas based on the remaining Eth balance and ensure it is greater than baseFee + maxPriorityFeePerGas.
    const remainingEth = BigInt(gasSummary.remaining_eth);
    const maxFeePerGas = remainingEth / estimatedGasUnits;
    const currentMaxFeePerGas = baseFee + maxPriorityFeePerGas;

    console.log('remainingEth', remainingEth);
    console.log('maxFeePerGas', maxFeePerGas);
    console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);
    console.log('baseFee', baseFee);
    console.log('currentMaxFeePerGas', currentMaxFeePerGas);

    // Check if user maxFeePerGas is at least greater than current base fee + max priority fee
    if (currentMaxFeePerGas > maxFeePerGas) {
      const extraNeeded = estimatedGasEth - remainingEth;

      const error = new Error('Insufficient gas for rescue transaction', {
        cause: {
          type: 'insufficient_gas',
          extraGasEthNeeded: extraNeeded,
          estimatedGasEth,
          remainingEth,
        },
      });

      throw error;
    }

    // 7. Create rescue transaction record with pending status
    const rescueTransaction = await DatabaseService.createRescueTransaction({
      compromised_address: compromisedAddress.toLowerCase(),
      receiver_address: receiverWallet.toLowerCase(),
      tokens: tokens.map((t) => t.toLowerCase()),
      gas_transaction_hash: gasTransactionHash || '',
      rescue_transaction_hash: '', // Will be updated after transaction
      gas_used: '0', // Will be updated after transaction
      eth_used: '0', // Will be updated after transaction
      chain_id: chainId,
      deadline: Number(deadline),
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

    return {
      rescueTxHash,
      ethUsed,
      status,
      rescueTransaction,
    };
  }
}
