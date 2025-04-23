export interface Tx {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gas: bigint;
}
