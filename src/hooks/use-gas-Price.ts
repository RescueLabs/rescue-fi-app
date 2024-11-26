import { JsonRpcProvider } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { RPC_URL } from '@/lib/constants';

export const useGasPrice = () => {
  const provider = useMemo(() => new JsonRpcProvider(RPC_URL), []);

  const [_gasPrice, setGasPrice] = useState<bigint>(BigInt(0));

  useEffect(() => {
    async function getFeeData() {
      const feeData = await provider.getFeeData();
      setGasPrice(BigInt(Number(feeData.gasPrice)));
    }
    getFeeData();
  }, [provider]);

  const gasPrice = (_gasPrice * BigInt(120)) / BigInt(100);

  return { gasPrice };
};
