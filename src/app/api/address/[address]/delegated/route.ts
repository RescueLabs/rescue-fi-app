import { NextRequest, NextResponse } from 'next/server';
import { getContract } from 'viem';

import rescuroorAbi from '@/constants/abis/rescurooor.json';
import { Web3Service } from '@/lib/services/web3';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: `0x${string}` } },
) {
  const { address } = params;
  const chainIdStr = request.nextUrl.searchParams.get('chainId');

  if (!chainIdStr) {
    return NextResponse.json(
      { error: 'Chain ID is required' },
      { status: 400 },
    );
  }

  const chainId = Number(chainIdStr);

  const web3Service = new Web3Service();
  const isDelegated = await web3Service.isDelegated(address, Number(chainId));
  const publicClient = web3Service.getPublicClient(Number(chainId));

  let nonce = '0';

  if (isDelegated) {
    const rescuroorDelegate = getContract({
      address: address as `0x${string}`,
      abi: rescuroorAbi,
      client: publicClient,
    });
    const blockNumber = await publicClient.getBlockNumber({
      cacheTime: 0,
    });

    const nonceNum = (await rescuroorDelegate.read.nonces([address], {
      blockNumber,
      blockTag: 'pending',
    })) as number;

    nonce = nonceNum.toString();
  }

  return NextResponse.json({
    isDelegated,
    nonce,
  });
}
