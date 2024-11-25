import axios from 'axios';
import { useCallback } from 'react';

import { getPublicClient } from '@/lib/utils';

import { useGasPrice } from './use-gas-Price';

const publicClient = getPublicClient();

// returns gas for rescuing wallet fund in WEI
export const useEstimateClaimAirdropGas = () => {
  // todo: make sure this updates
  const { gasPrice } = useGasPrice();

  const estimateGas = useCallback(
    async ({
      airdropContractAddress,
      methodId,
    }: {
      airdropContractAddress: string;
      methodId: string;
    }) => {
      const latestBlock = await publicClient.getBlockNumber();
      const response = await axios.get('/api/estimate-claim-airdrop-gas', {
        params: {
          airdropContractAddress,
          latestBlock: String(latestBlock),
          methodId,
        },
      });

      const gas = BigInt(response.data.data);
      return {
        gasInWei: gas * gasPrice, // ethereum to send
        gas,
        gasPrice,
      };
    },
    [gasPrice],
  );

  return estimateGas;
};
