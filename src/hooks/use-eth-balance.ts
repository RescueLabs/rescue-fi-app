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
}: {
  rescuerPrivateKey: string;
  balanceNeeded?: bigint;
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

      return (balanceNeeded ?? BigInt(0)) - balance;
    },
    refetchInterval: 5000,
    enabled: validatePrivateKey(rescuerPrivateKey) && !ethBalanceEnough,
  });

  useEffect(() => {
    if (
      ethRemainingBalance &&
      Number(ethRemainingBalance) <= 0 &&
      balanceNeeded !== undefined &&
      balanceNeeded !== null
    ) {
      setEthBalanceEnough(true);
    }
  }, [ethRemainingBalance, balanceNeeded]);

  return {
    ethBalanceEnough,
    ethRemainingBalance: ethRemainingBalance || balanceNeeded,
    isFetchingEthRemainingBalance,
  };
};
