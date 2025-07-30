import { web3Service } from './web3';

export class BalanceService {
  /**
   * Check if backend wallet has sufficient balance for rescue transaction
   * This is used in local mode where we don't use the database
   */
  static async checkBackendWalletBalance(
    chainId: number,
    estimatedGasEth: bigint,
  ): Promise<{
    hasEnoughBalance: boolean;
    currentBalance: bigint;
    requiredBalance: bigint;
    deficit: bigint;
  }> {
    try {
      // Get backend wallet address
      const backendAddress = process.env
        .BACKEND_WALLET_ADDRESS as `0x${string}`;
      if (!backendAddress) {
        throw new Error(
          'BACKEND_WALLET_ADDRESS environment variable is required',
        );
      }

      // Get current balance
      const currentBalance = await web3Service.getBalance(
        backendAddress,
        chainId,
      );

      // Check if balance is sufficient
      const hasEnoughBalance = currentBalance >= estimatedGasEth;
      const deficit = hasEnoughBalance
        ? BigInt(0)
        : estimatedGasEth - currentBalance;

      return {
        hasEnoughBalance,
        currentBalance,
        requiredBalance: estimatedGasEth,
        deficit,
      };
    } catch (error) {
      console.error('Error checking backend wallet balance:', error);
      throw new Error('Failed to check backend wallet balance');
    }
  }
}
