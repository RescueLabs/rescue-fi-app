import {
  FlashbotsBundleProvider,
  FlashbotsTransactionResponse,
  RelayResponseError,
} from '@flashbots/ethers-provider-bundle';
import axios from 'axios';
import { ethers, JsonRpcProvider } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

import {
  RELAY_URLS,
  CHAIN_ID,
  RPC_URLS,
  FLASHBOTS_RPC_URLS,
} from '@/constants';

const provider = new JsonRpcProvider(RPC_URLS[CHAIN_ID]);
const authSigner = ethers.Wallet.createRandom();

const getBundle = async (bundleId: string): Promise<string[]> => {
  try {
    const bundle = (
      await axios.get(`${FLASHBOTS_RPC_URLS[CHAIN_ID]}/bundle?id=${bundleId}`)
    ).data;
    return bundle.rawTxs.reverse();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const formatSimulationResponse = (simulationResponse: any) => {
  const formattedSimulationResponse = { ...simulationResponse };
  Object.entries(simulationResponse).forEach(([key, value]) => {
    if (typeof value === 'bigint') {
      formattedSimulationResponse[key] = value.toString();
    }
  });
  return formattedSimulationResponse;
};

// Flashbots call is moved here to handle CORS error in the browser.
// You'll g a CORS error if you try to make the call directly from the client.
export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { bundleId } = body;

  const txs = await getBundle(bundleId);
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    authSigner,
    RELAY_URLS[CHAIN_ID],
  );

  const blockNumber = (await provider.getBlockNumber()) + 3;

  let flashbotsResponse = await flashbotsProvider.sendRawBundle(
    txs,
    blockNumber,
  );

  let error = (flashbotsResponse as RelayResponseError).error;
  if (error) {
    const errorMessage = error.message;
    console.log(
      '❌ Sending bundle reverted with',
      errorMessage,
      'and status',
      error.code,
    );
    return NextResponse.json(
      {
        success: false,
        message: `Sending bundle reverted with: ${error.message}`,
      },
      { status: 203 },
    );
  }

  flashbotsResponse = flashbotsResponse as FlashbotsTransactionResponse;
  // console.log('flashbotsResponse: ', flashbotsResponse);
  const simulationResponse = await flashbotsResponse.simulate();
  // console.log('simulationResponse: ', simulationResponse);
  error = (simulationResponse as RelayResponseError).error;
  if (error) {
    console.log(
      '❌ Bundle simulation reverted with',
      error.message,
      'and status',
      error.code,
    );
    return NextResponse.json(
      {
        success: false,
        message: `Bundle simulation reverted with: ${error.message}`,
      },
      { status: 203 },
    );
  }

  const bundleResolution = await flashbotsResponse.wait();
  // console.log('bundleResolution: ', bundleResolution);

  if (bundleResolution === 0) {
    return NextResponse.json(
      {
        success: true,
        message: 'Bundle sent successfully',
        simulationResult: formatSimulationResponse(simulationResponse),
      },
      { status: 200 },
    );
  }

  if (bundleResolution === 1) {
    return NextResponse.json(
      {
        success: false,
        message: 'Block passed without bundle inclusion',
        simulationResult: formatSimulationResponse(simulationResponse),
      },
      { status: 203 },
    );
  }

  if (bundleResolution === 2) {
    return NextResponse.json(
      {
        success: false,
        message: 'Account nonce too high',
        simulationResult: formatSimulationResponse(simulationResponse),
      },
      { status: 203 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: 'Unexpected bundle resolution status',
      simulationResult: formatSimulationResponse(simulationResponse),
    },
    { status: 203 },
  );
};
