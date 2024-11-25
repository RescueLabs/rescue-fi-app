import { Contract, JsonRpcProvider } from 'ethers';
import { useCallback, useMemo } from 'react';

import { RPC_URL } from '@/lib/constants';
import ERC20_ABI from '@/lib/constants/abis/erc20.json';

export const useTokenDetails = () => {
  const provider = useMemo(() => {
    return new JsonRpcProvider(RPC_URL);
  }, []);

  const getTokenDetails = useCallback(
    async (tokenAddress: string) => {
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();

      return { symbol, decimals };
    },
    [provider],
  );

  return { getTokenDetails };
};
