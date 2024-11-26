import { useQuery } from '@tanstack/react-query';
import { JsonRpcProvider } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { RPC_URL } from '@/lib/constants';
import {
  getWalletAddressFromPrivateKey,
  validatePrivateKey,
} from '@/lib/utils';

export const useEthBalance = ({
  rescuerPrivateKey,
  balanceNeeded,
  options,
}: {
  rescuerPrivateKey: string;
  balanceNeeded?: bigint;
  options?: {
    enabled?: boolean;
  };
}) => {
  const [ethBalanceEnough, setEthBalanceEnough] = useState<boolean>(false);

  const provider = useMemo(() => new JsonRpcProvider(RPC_URL), []);

  const {
    data: ethRemainingBalance,
    isFetching: isFetchingEthRemainingBalance,
  } = useQuery({
    queryKey: ['eth-balance'],
    queryFn: async () => {
      if (!rescuerPrivateKey) {
        return balanceNeeded;
      }

      const rescuerAddress = getWalletAddressFromPrivateKey(rescuerPrivateKey);

      const balance = await provider?.getBalance(rescuerAddress);

      return (balanceNeeded ?? BigInt(Number.MAX_SAFE_INTEGER)) - balance;
    },
    refetchInterval: 5000,
    enabled:
      validatePrivateKey(rescuerPrivateKey) && (options?.enabled ?? true),
  });

  useEffect(() => {
    if (!validatePrivateKey(rescuerPrivateKey)) {
      setEthBalanceEnough(false);
    }
  }, [rescuerPrivateKey]);

  useEffect(() => {
    if (
      ethRemainingBalance &&
      Number(ethRemainingBalance) <= 0 &&
      balanceNeeded !== undefined &&
      balanceNeeded !== null &&
      validatePrivateKey(rescuerPrivateKey)
    ) {
      setEthBalanceEnough(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethRemainingBalance, balanceNeeded]);

  return {
    ethBalanceEnough,
    ethRemainingBalance: ethRemainingBalance || balanceNeeded,
    isFetchingEthRemainingBalance,
  };
};
