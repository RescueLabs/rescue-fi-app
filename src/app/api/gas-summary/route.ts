import { NextRequest, NextResponse } from 'next/server';

import { DatabaseService } from '@/lib/services/database';

export async function GET(request: NextRequest) {
  try {
    const chainId = request.nextUrl.searchParams.get('chainId');
    const address = request.nextUrl.searchParams.get('address');

    if (!chainId || !/^[0-9]+$/.test(chainId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid chainId format',
        },
        { status: 400 },
      );
    }

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid address format',
        },
        { status: 400 },
      );
    }

    console.log(
      `Fetching gas summary for address, ${address} on chainId: ${chainId}`,
    );

    const gasSummary = await DatabaseService.getGasSummary(
      address,
      Number(chainId),
    );

    return NextResponse.json({
      success: true,
      data: gasSummary,
    });
  } catch (error) {
    console.error('Error fetching gas summary:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gas summary',
      },
      { status: 500 },
    );
  }
}
