import { NextRequest, NextResponse } from 'next/server';

import { gasPaymentService } from '@/lib/services/gasPaymentService';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting gas transaction update process...');

    const results = await gasPaymentService.updateGasTransactions();

    console.log(
      `Gas transaction update completed. Processed: ${results.processed}, Errors: ${results.errors.length}`,
    );

    return NextResponse.json({
      success: true,
      data: {
        processed: results.processed,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error('Error updating gas transactions:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update gas transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
