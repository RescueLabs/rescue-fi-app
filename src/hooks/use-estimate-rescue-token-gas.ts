import axios from 'axios';
import { useCallback } from 'react';

import { getPublicClient } from '@/lib/utils';

import { useGasPrice } from './use-gas-Price';

const publicClient = getPublicClient();

// returns gas for rescuing wallet fund in WEI
export const useEstimateRescueTokenGas = (tokenAddress: string) => {
  // todo: make sure this updates
  const { gasPrice } = useGasPrice();
  console.log('gasPrice', gasPrice);

  const estimateGas = useCallback(async () => {
    const latestBlock = await publicClient.getBlockNumber();
    const response = await axios.get('/api/estimate-send-token-gas', {
      params: {
        tokenAddress,
        latestBlock: String(latestBlock),
      },
    });

    const gas = BigInt(21000) + BigInt(response.data.data);
    return {
      gasInWei: gas * gasPrice,
      gas,
      gasPrice,
      txGases: [21000, response.data],
    };
  }, [tokenAddress, gasPrice]);

  return estimateGas;
};
