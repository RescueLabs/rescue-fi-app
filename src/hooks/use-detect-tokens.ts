import axios from 'axios';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { isAddress } from 'viem';

import { ITokenMetadata } from '@/types/tokens';

export const useDetectTokens = () => {
  const [detectedAssets, setDetectedAssets] = useLocalStorage<{
    [account: string]: {
      [chainId: number]: ITokenMetadata[];
    };
  }>('detectedAssets', {});

  const getDetectedTokens = useCallback(
    async (
      victimWalletAddress: string,
      chainId: number,
      forceFetch = false,
    ): Promise<ITokenMetadata[] | undefined> => {
      if (!isAddress(victimWalletAddress)) {
        toast.error('Invalid wallet address');
        return undefined;
      }

      if (
        detectedAssets[victimWalletAddress] &&
        detectedAssets[victimWalletAddress][chainId] &&
        detectedAssets[victimWalletAddress][chainId].length > 0 &&
        !forceFetch
      ) {
        return detectedAssets[victimWalletAddress][chainId];
      }

      try {
        const response = await axios.get(
          `/api/address/${victimWalletAddress}/detect-tokens?chainId=${chainId}`,
        );

        const tokensWithMetadata = response.data;

        setDetectedAssets(
          (prev: {
            [account: string]: { [chainId: number]: ITokenMetadata[] };
          }) => ({
            ...prev,
            [victimWalletAddress]: {
              ...prev[victimWalletAddress],
              [chainId]: tokensWithMetadata,
            },
          }),
        );

        return tokensWithMetadata;
      } catch (e) {
        console.error(`Error fetching assets of victim wallet: ${e}`);
        toast.error(`Error fetching assets of victim wallet`);
        return undefined;
      }
    },
    [detectedAssets],
  );

  return {
    getDetectedTokens,
  };
};
