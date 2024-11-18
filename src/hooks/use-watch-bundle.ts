import { useCallback, useState } from 'react';

import { AVG_SEPOLIA_BLOCK_TIME } from '@/lib/constants';

import { getPublicClient } from '../lib/utils';

const publicClient = getPublicClient();

export const useWatchBundle = () => {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);

  const watchBundle = useCallback(
    async (txHash: `0x${string}`, maxBlockNumber: number) => {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: maxBlockNumber * AVG_SEPOLIA_BLOCK_TIME * 1000,
      });
      if (receipt.status === 'success') {
        setLoading(false);
        setSuccess(true);
      } else {
        setFailed(true);
      }
    },
    [],
  );

  return { watchBundle, loading, failed, success, setLoading };
};
