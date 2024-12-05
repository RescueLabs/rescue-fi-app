import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

import { API_KEY, BASE_ETHERSCAN_URL } from '@/lib/constants';

export const GET = async (req: NextRequest) => {
  const tokenAddress = req.nextUrl.searchParams.get('tokenAddress');
  const latestBlock = req.nextUrl.searchParams.get('latestBlock');
  // change url when deploy to mainnet
  const etherscanUrl = `${BASE_ETHERSCAN_URL}/api?apikey=${API_KEY}&module=account&action=txlist&address=${tokenAddress}&sort=desc&endblock=${latestBlock}&startblock=0&offset=1000&page=1`;

  let response;
  try {
    response = await axios.get(etherscanUrl);
  } catch (error) {
    console.log('EstimateSendTokenGasError', error);
    return NextResponse.json({ error }, { status: 500 });
  }
  const data = response.data.result;

  let totalSample = 0;
  let totalGasUsed = 0;

  for (let i = 0; i < data.length; i++) {
    const tx = data[i];
    if (
      tx.to.toLowerCase() === tokenAddress?.toLowerCase() &&
      tx.txreceipt_status === '1' &&
      tx.methodId === '0xa9059cbb' // methodId for transfer(address to, uint256 value)
    ) {
      totalSample += 1;
      totalGasUsed += parseInt(tx.gasUsed, 10);
    }
    // sample 30 txs at most
    if (totalSample === 30) {
      break;
    }
  }

  let averageGasUsed = totalGasUsed / totalSample;
  averageGasUsed = Math.round(averageGasUsed * 1.5); // increase by 50%

  if (!averageGasUsed) {
    averageGasUsed = 80000;
  }

  return NextResponse.json({ data: averageGasUsed });
};

// smple tx response
// {
//     "blockNumber": "7093772",
//     "timeStamp": "1731824268",
//     "hash": "0x162a55134486cbdf016e6585f9e14b383913b4bb824506ee502e944e89ee0477",
//     "nonce": "33",
//     "blockHash": "0x991c0160dac91b115b2e3449be9fc3ad756e68c5c871b8260d29f90f1354c29b",
//     "transactionIndex": "54",
//     "from": "0xadb38545537f23cd0c01bf59fb57714191291c55",
//     "to": "0x3523fdf00ed10b874f84fe0b677de04151840353",
//     "value": "0",
//     "gas": "47336",
//     "gasPrice": "3166724951",
//     "isError": "0",
//     "txreceipt_status": "1",
//     "input": "0x095ea7b30000000000000000000000005f7cae7d1efc8cc05da97d988cffc253ce3273ef00000000000000000000000000000000000000000000000000038d7ea4c68000",
//     "contractAddress": "",
//     "cumulativeGasUsed": "2237470",
//     "gasUsed": "46952",
//     "confirmations": "2435",
//     "methodId": "0x095ea7b3",
//     "functionName": "approve(address to, uint256 tokenId)"
// }
