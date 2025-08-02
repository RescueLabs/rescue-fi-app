import { JsonRpcProvider } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { CHAIN_ID, RPC_URLS } from '@/constants';

export const useGasPrice = () => {
  const provider = useMemo(() => new JsonRpcProvider(RPC_URLS[CHAIN_ID]), []);

  const [{ maxFeePerGas, maxPriorityFeePerGas }, setGasPrice] = useState<{
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }>({ maxFeePerGas: BigInt(0), maxPriorityFeePerGas: BigInt(0) });

  useEffect(() => {
    async function getFeeData() {
      const feeData = await provider.getFeeData();
      setGasPrice({
        maxFeePerGas: feeData.maxFeePerGas ?? BigInt(0),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? BigInt(0),
      });
    }
    getFeeData();
  }, [provider]);

  let _maxFeePerGas = (maxFeePerGas * BigInt(120)) / BigInt(100);
  const _maxPriorityFeePerGas =
    (maxPriorityFeePerGas * BigInt(120)) / BigInt(100);
  _maxFeePerGas += _maxPriorityFeePerGas - maxPriorityFeePerGas;

  return {
    maxFeePerGas: _maxFeePerGas,
    maxPriorityFeePerGas: _maxPriorityFeePerGas,
  };
};
