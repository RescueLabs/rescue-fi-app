import { NextRequest, NextResponse } from 'next/server';

import { MEV_CLIENT } from '@/lib/constants';

export const POST = async (req: NextRequest, res: NextResponse) => {
  const body = await req.json();
  const { bundle, blockNumber } = body;

  let result;
  try {
    result = await MEV_CLIENT.sendBundle({
      body: bundle,
      inclusion: {
        block: Number(blockNumber) + 1,
        maxBlock: Number(blockNumber) + 24,
      },
      privacy: {
        builders: ['flashbots', 'beaverbuild.org', 'rsync', 'Titan'],
      },
    });
  } catch (error) {
    console.log('SendBundleError', error);
    result = { bundleHash: '' };
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data: result });
};
