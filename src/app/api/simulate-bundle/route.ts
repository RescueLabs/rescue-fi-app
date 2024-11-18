import { NextRequest, NextResponse } from 'next/server';

import { getSepoliaMevShareClient } from '@/lib/flashbots';

export const POST = async (req: NextRequest, res: NextResponse) => {
  const body = await req.json();
  const { bundle, blockNumber, privateKey } = body;

  // connect to MEV-Share on mainnet
  const mevShareClient = getSepoliaMevShareClient(privateKey);

  let result = await mevShareClient.simulateBundle({
    body: bundle,
    inclusion: {
      block: blockNumber + 1,
      maxBlock: blockNumber + 24,
    },
  });

  result = JSON.parse(
    JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );

  return NextResponse.json({ data: result });
};
