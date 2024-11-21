import axios from 'axios';
import { useCallback, useState } from 'react';

import { getPublicClient } from '../lib/utils';

const publicClient = getPublicClient();

export const useWatchBundle = () => {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);

  const watchBundle = useCallback(
    async (txHash: `0x${string}`, blockNumber: bigint) => {
      const result = await axios.get(
        `/api/get-block-countdown?blockNumber=${blockNumber}`,
      );
      const deadline = Number(result.data.data.EstimateTimeInSec) * 1000;
      console.log(
        'deadline',
        new Date(new Date().getTime() + deadline).toString(),
      );

      try {
        console.log('waiting for tx receipt', txHash);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          timeout: 30000,
        });
        console.log('tx receipt', receipt);
        if (receipt.status === 'success') {
          setSuccess(true);
        } else {
          setFailed(true);
        }
      } catch (error) {
        setFailed(true);
        console.log(error);
      }
      setLoading(false);
    },
    [],
  );

  return {
    watchBundle,
    loading,
    failed,
    success,
    setLoading,
    setSuccess,
    setFailed,
  };
};
