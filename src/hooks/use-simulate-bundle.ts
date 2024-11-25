import { BundleParams } from '@flashbots/mev-share-client';
import axios from 'axios';
import { useCallback } from 'react';

import { getPublicClient } from '@/lib/utils';

const publicClient = getPublicClient();

export const useSimulateBundle = () => {
  const simulateBundle = useCallback(async (bundle: BundleParams['body']) => {
    const result = await axios.post('/api/simulate-bundle', {
      bundle,
      blockNumber: String(await publicClient.getBlockNumber()),
    });

    console.log(result.data.data);
  }, []);

  return { simulateBundle };
};
