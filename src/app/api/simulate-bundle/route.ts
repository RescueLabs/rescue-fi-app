import { NextRequest, NextResponse } from 'next/server';

import { MEV_AUTH_SIGNER_PRIVATE_KEY } from '@/lib/constants';
import { getSepoliaMevShareClient } from '@/lib/flashbots';

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { bundle, blockNumber } = body;

  // connect to MEV-Share on mainnet
  const mevShareClient = getSepoliaMevShareClient(MEV_AUTH_SIGNER_PRIVATE_KEY);

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
