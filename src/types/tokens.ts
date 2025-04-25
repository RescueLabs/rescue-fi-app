export interface ITokenMetadata {
  image?: string;
  address: `0x${string}`;
  type: string;
  info: string;
  symbol: string;
  amount: string;
  amountBigInt: string;
  decimals: number;
  toEstimate: {
    from: `0x${string}`;
    to: `0x${string}`;
    data: `0x${string}`;
  };
}
