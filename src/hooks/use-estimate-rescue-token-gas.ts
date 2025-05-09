import axios from 'axios';
import { useCallback } from 'react';

import { getPublicClient, validateTokenAddress } from '@/lib/utils';

import { useGasPrice } from './use-gas-Price';

const publicClient = getPublicClient();

// returns gas for rescuing wallet fund in WEI
export const useEstimateRescueTokenGas = (tokenAddress: string) => {
  // todo: make sure this updates
  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice();

  const estimateGas = useCallback(async () => {
    if (!validateTokenAddress(tokenAddress))
      return {
        gasInWei: BigInt(0),
        gas: BigInt(0),
        maxFeePerGas,
        maxPriorityFeePerGas,
      };

    const latestBlock = await publicClient.getBlockNumber();
    const response = await axios.get('/api/estimate-send-token-gas', {
      params: {
        tokenAddress,
        latestBlock: String(latestBlock),
      },
    });

    const gas = BigInt(response.data.data);
    return {
      gasInWei: gas * maxFeePerGas, // ethereum to send
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    };
  }, [tokenAddress, maxFeePerGas, maxPriorityFeePerGas]);

  return estimateGas;
};
