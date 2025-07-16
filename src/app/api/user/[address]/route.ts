import { NextRequest, NextResponse } from 'next/server';

import { DatabaseService } from '@/lib/services/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } },
) {
  try {
    const { address } = params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid address format',
        },
        { status: 400 },
      );
    }

    console.log(`Fetching user details for address: ${address}`);

    const userDetails = await DatabaseService.getUserDetails(address);

    return NextResponse.json({
      success: true,
      data: userDetails,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
