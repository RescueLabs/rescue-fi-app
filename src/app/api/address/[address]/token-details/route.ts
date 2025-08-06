import { Alchemy, Network } from 'alchemy-sdk';
import { Contract, JsonRpcProvider } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, formatUnits, isAddress } from 'viem';

import { ALCHEMY_BASE_SETTINGS, ALCHEMY_NETWORKS } from '@/configs/alchemy';
import { getMode } from '@/configs/app';
import { getRpcUrl } from '@/configs/networks';
import ERC20_ABI from '@/constants/abis/erc20.json';
import { ITokenMetadata } from '@/types/tokens';

export const GET = async (
  request: NextRequest,
  { params }: { params: { address: `0x${string}` } },
) => {
  const { address: victimWalletAddress } = params;
  const chainIdStr = request.nextUrl.searchParams.get('chainId');
  const tokenAddress = request.nextUrl.searchParams.get('tokenAddress');

  if (!chainIdStr || !victimWalletAddress || !tokenAddress) {
    return NextResponse.json(
      {
        error: 'Chain ID, victim wallet address and token address are required',
      },
      { status: 400 },
    );
  }

  if (!isAddress(victimWalletAddress)) {
    return NextResponse.json(
      { error: 'Invalid wallet address' },
      { status: 400 },
    );
  }

  const provider = new JsonRpcProvider(getRpcUrl(+chainIdStr, getMode()));

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
          args: ['0x0000000000000000000000000000000000000000', tokenBalance],
        }) as `0x${string}`,
      },
    };

    return NextResponse.json(tokenMetadata, { status: 200 });
  } catch (e) {
    console.error(`Error fetching token details: ${e}`);
    return NextResponse.json(
      { error: `Error fetching token details: ${e}` },
      { status: 500 },
    );
  }
};
