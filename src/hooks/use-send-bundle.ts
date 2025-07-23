import {
  FlashbotsBundleProvider,
  FlashbotsTransactionResponse,
  RelayResponseError,
  SimulationResponseSuccess,
  TransactionSimulationBase,
} from '@flashbots/ethers-provider-bundle';
import axios from 'axios';
import { ethers, JsonRpcProvider } from 'ethers';

import { RPC_URLS, RELAY_URLS, CHAIN_ID } from '@/constants';
import { getPublicClient } from '@/lib/utils';

const authSigner = ethers.Wallet.createRandom();

interface SendBundleResponse {
  transactions?: TransactionSimulationBase[];
  error?: {
    message: string;
    code: number;
  };
}

const publicClient = getPublicClient();
export const useSendBundle = () => {
  const provider = new JsonRpcProvider(RPC_URLS[CHAIN_ID]);

  const getBundle = async (bundleId: string): Promise<string[]> => {
    try {
      const bundle = (
        await axios.get(`https://rpc.flashbots.net/bundle?id=${bundleId}`)
      ).data;
      return bundle.rawTxs.reverse();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const sendBundle = async (bundleId: string): Promise<SendBundleResponse> => {
    const txs = await getBundle(bundleId);
    const flashbotsProvider = await FlashbotsBundleProvider.create(
      provider,
      authSigner,
      RELAY_URLS[CHAIN_ID],
    );

    const blockNumber = (await publicClient.getBlockNumber()) + BigInt(1);

    let flashbotsResponse = await flashbotsProvider.sendRawBundle(
      txs,
      Number(blockNumber),
    );

    let error = (flashbotsResponse as RelayResponseError).error;
    if (error) {
      return {
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    flashbotsResponse = flashbotsResponse as FlashbotsTransactionResponse;
    const simulation = await flashbotsResponse.simulate();

    error = (simulation as RelayResponseError).error;
    if (error) {
      return {
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    const bundleResolution = await flashbotsResponse.wait();

    if (bundleResolution === 0) {
      return {
        transactions: (simulation as SimulationResponseSuccess).results,
      };
    }

    if (bundleResolution === 1) {
      return {
        error: {
          message: 'Block passed without bundle inclusion',
          code: 1,
        },
      };
    }

    if (bundleResolution === 2) {
      return {
        error: {
          message: 'Account nonce too high',
          code: 2,
        },
      };
    }

    return {
      error: {
        message: 'Unknown error',
        code: 3,
      },
    };
  };

  return { sendBundle };
};
