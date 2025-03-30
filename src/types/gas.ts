export type GasDetails = {
  gasInWei: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  totalGas: bigint;
  txGases: bigint[];
};
