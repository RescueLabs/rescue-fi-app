import { Alchemy, Network } from 'alchemy-sdk';
import { Contract, JsonRpcProvider } from 'ethers';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { encodeFunctionData, formatUnits, isAddress } from 'viem';

import { ALCHEMY_NETWORKS } from '@/configs/alchemy';
import { getMode } from '@/configs/app';
import { getRpcUrl } from '@/configs/networks';
import ERC20_ABI from '@/constants/abis/erc20.json';
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
        const provider = new JsonRpcProvider(getRpcUrl(chainId, getMode()));

        const alchemy = new Alchemy({
          apiKey: process.env.ALCHEMY_API_KEY as string,
          network:
            ALCHEMY_NETWORKS[chainId as keyof typeof ALCHEMY_NETWORKS] ||
            Network.ETH_MAINNET,
        });

        if (!isAddress(victimWalletAddress)) {
          return null;
        }

        if (!alchemy) {
          toast.error(
            'Api rate limit has been reached. Please try again later.',
          );
          return null;
        }

        const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
        const tokenBalance = await tokenContract.balanceOf(victimWalletAddress);

        const metadata = await alchemy.core.getTokenMetadata(tokenAddress);

        const tokenMetadata: ITokenMetadata = {
          type: 'erc20',
          address: tokenAddress as `0x${string}`,
          info: `ERC20 - ${tokenAddress || metadata.symbol || metadata.name}`?.toLowerCase(),
          symbol: metadata.symbol || '',
          amount: formatUnits(tokenBalance || '0', metadata.decimals || 18),
          amountBigInt: (tokenBalance || BigInt(0)).toString(),
          decimals: metadata.decimals || 18,
          toEstimate: {
            from: victimWalletAddress as `0x${string}`,
            to: tokenAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: 'transfer',
              args: [
                '0x0000000000000000000000000000000000000000',
                tokenBalance,
              ],
            }) as `0x${string}`,
          },
        };

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
