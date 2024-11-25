import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import { API_KEY, BASE_ETHERSCAN_URL } from '@/lib/constants';

export const GET = async (req: NextRequest) => {
  const blockNumber = req.nextUrl.searchParams.get('blockNumber');

  const etherscanUrl = `${BASE_ETHERSCAN_URL}/api?module=block&action=getblockcountdown&blockno=${blockNumber}&apikey=${API_KEY}`;

  let response;
  try {
    response = await axios.get(etherscanUrl);
  } catch (error) {
    console.log('GetBlockCountdownError', error);
    return NextResponse.json({ error }, { status: 500 });
  }
  const data = response.data.result;

  return NextResponse.json({ data });
};
