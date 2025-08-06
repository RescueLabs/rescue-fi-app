import axios from 'axios';
import { useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { isAddress } from 'viem';

import { ITokenMetadata } from '@/types/tokens';

export const useTokenDetails = () => {
  const [_, setDetectedAssets] = useLocalStorage<{
    [account: string]: ITokenMetadata[];
  }>('detectedAssets', {});

  const getTokenDetails = useCallback(
    async (
      tokenAddress: string,
      victimWalletAddress: string,
      chainId: number,
      options?: {
        onError: () => void;
      },
    ) => {
      try {
        if (!isAddress(victimWalletAddress)) {
          return null;
        }

        const response = await axios.get(
          `/api/address/${victimWalletAddress}/token-details?chainId=${chainId}&tokenAddress=${tokenAddress}`,
        );

        const tokenMetadata = response.data;

        setDetectedAssets((prev: { [account: string]: ITokenMetadata[] }) => ({
          ...prev,
          [victimWalletAddress]: {
            ...(prev?.[victimWalletAddress] || {}),
            tokenMetadata,
          },
        }));

        return tokenMetadata;
      } catch {
        options?.onError?.();
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { getTokenDetails };
};
