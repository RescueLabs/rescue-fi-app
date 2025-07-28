import { PublicClient } from 'viem';

/**
 * Calculate EIP-1559 gas fees using Blocknative's recommended formula:
 * Max Fee = (2 × Base Fee) + Max Priority Fee
 *
 * This provides protection against base fee increases for up to 6 consecutive 100% full blocks.
 * Reference: https://www.blocknative.com/blog/eip-1559-fees
 */
export async function calculateEIP1559Fees(
  publicClient: PublicClient,
  customPriorityFee?: bigint,
): Promise<{
  baseFee: bigint;
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
}> {
  // Get the base fee from the latest block
  const latestBlock = await publicClient.getBlock({ blockTag: 'latest' });
  console.log('latestBlock', latestBlock);
  const baseFee = latestBlock?.baseFeePerGas ?? BigInt(0);

  // Get priority fee estimate from the network
  const { maxPriorityFeePerGas } = await publicClient.estimateFeesPerGas();

  // Use custom priority fee if provided, otherwise use network estimate
  const priorityFee = customPriorityFee ?? maxPriorityFeePerGas;

  // Use Blocknative's recommended formula: Max Fee = (2 × Base Fee) + Max Priority Fee
  // This provides protection against base fee increases for up to 6 consecutive 100% full blocks
  const maxFeePerGas = BigInt(2) * baseFee + priorityFee;

  return {
    baseFee,
    maxPriorityFeePerGas: priorityFee,
    maxFeePerGas,
  };
}

/**
 * Calculate total gas cost in ETH for a given number of gas units
 */
export function calculateTotalGasCost(
  gasUnits: bigint,
  maxFeePerGas: bigint,
): bigint {
  return gasUnits * maxFeePerGas;
}

/**
 * Validate that gas fees are reasonable
 */
export function validateGasFees(
  maxFeePerGas: bigint,
  maxPriorityFeePerGas: bigint,
  baseFee: bigint,
): boolean {
  // Max fee should be at least base fee + priority fee
  if (maxFeePerGas < baseFee + maxPriorityFeePerGas) {
    return false;
  }

  // Priority fee should be reasonable (not more than 100 GWEI)
  if (maxPriorityFeePerGas > BigInt(100) * BigInt(1e9)) {
    return false;
  }

  return true;
}
