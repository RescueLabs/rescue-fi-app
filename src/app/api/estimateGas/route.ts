import { NextRequest, NextResponse } from 'next/server';

import { getMode } from '@/configs/app';
import { DatabaseService } from '@/lib/services/database';
import { web3Service, Web3Service } from '@/lib/services/web3';

export async function GET(request: NextRequest) {
  try {
    const chainId = request.nextUrl.searchParams.get('chainId');
    const data = request.nextUrl.searchParams.get('data');
    const compromisedAddress =
      request.nextUrl.searchParams.get('compromisedAddress');
    const authorization = request.nextUrl.searchParams.get('authorization');
    const nonce = request.nextUrl.searchParams.get('nonce');

    if (!chainId || !/^[0-9]+$/.test(chainId)) {
      console.error('Invalid chainId format', chainId);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid chainId format',
        },
        { status: 400 },
      );
    }

    if (
      !compromisedAddress ||
      !/^0x[a-fA-F0-9]{40}$/.test(compromisedAddress)
    ) {
      console.error('Invalid compromised address format', compromisedAddress);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid address format',
        },
        { status: 400 },
      );
    }

    if (!data || data.length < 650) {
      console.error('Invalid data format', data);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data format',
        },
        { status: 400 },
      );
    }

    if (authorization && !/^0x[a-fA-F0-9]{130}$/.test(authorization)) {
      console.error('Invalid authorization format', authorization);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid authorization format',
        },
        { status: 400 },
      );
    }

    if ((authorization && !nonce) || (nonce && !/^[0-9]+$/.test(nonce))) {
      console.error('Invalid nonce format', nonce);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid nonce format',
        },
        { status: 400 },
      );
    }

    const publicClient = web3Service.getPublicClient(Number(chainId));
    const walletClient = web3Service.getWalletClient(Number(chainId));
    let gas;
    if (authorization) {
      const contractAddress = process.env
        .RESCUROOOR_CONTRACT_ADDRESS as `0x${string}`;
      const auhorizationData = Web3Service.parseAuthorization(
        authorization,
        Number(nonce),
        Number(chainId),
        contractAddress,
      );
      const authorizationList = [auhorizationData];
      gas = await publicClient.estimateGas({
        account: walletClient.account,
        to: compromisedAddress as `0x${string}`,
        data: data as `0x${string}`,
        authorizationList,
      });
    } else {
      gas = await publicClient.estimateGas({
        account: walletClient.account,
        to: compromisedAddress as `0x${string}`,
        data: data as `0x${string}`,
      });
    }

    let balance;
    if (getMode() === 'local') {
      balance = await publicClient.getBalance({
        address: walletClient.account?.address as `0x${string}`,
      });
    } else {
      const gasSummary = await DatabaseService.getGasSummary(
        compromisedAddress,
        Number(chainId),
      );
      balance = BigInt(gasSummary.remaining_eth);
    }

    const gasData = await web3Service.gasToEth(gas, Number(chainId));
    const gasInEth = gasData.gasInEth;
    const _gasData = {
      gasInEth: gasInEth.toString(),
      maxFeePerGas: gasData.maxFeePerGas.toString(),
      maxPriorityFeePerGas: gasData.maxPriorityFeePerGas.toString(),
      balance,
      deficit: balance > gasInEth ? 0 : gasInEth - balance,
    };

    return NextResponse.json({
      ..._gasData,
    });
  } catch (error) {
    console.error('Error fetching gas estimate:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gas estimate',
      },
      { status: 500 },
    );
  }
}
