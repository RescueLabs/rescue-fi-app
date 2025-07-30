import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import { API_KEY, CHAIN_ID, ETHERSCAN_URLS } from '@/constants';

export const GET = async (req: NextRequest) => {
  const blockNumber = req.nextUrl.searchParams.get('blockNumber');

  const etherscanUrl = `${ETHERSCAN_URLS[CHAIN_ID]}/api?module=block&action=getblockcountdown&blockno=${blockNumber}&apikey=${API_KEY}`;

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
