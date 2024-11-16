import { BundleParams } from '@flashbots/mev-share-client';
import axios from 'axios';
import { JsonRpcProvider } from 'ethers';
import { useCallback, useMemo } from 'react';
import { privateKeyToAccount } from 'viem/accounts';

import { RPC_URL } from '@/lib/constants';

import { useGasPrice } from './use-gas-Price';
import { useSignTransaction } from './use-sign-transaction';
import { useWalletNonce } from './use-wallet-nonce';

export const useSendBundle = (privateKey: `0x${string}`) => {
  const provider = useMemo(() => new JsonRpcProvider(RPC_URL), []);

  const account = privateKeyToAccount(privateKey);

  const { gasPrice } = useGasPrice();

  const to = '0x0000000000000000000000000000000000000000';
  const value = BigInt(1);
  const data = '0x';
  const gasLimit = BigInt(21000);

  const nonce = useWalletNonce(account);
  const signedTransaction = useSignTransaction(
    account,
    to,
    value,
    nonce ?? 0,
    gasPrice,
    data,
    gasLimit,
  );

  const getSimulationResult = useCallback(
    async (pK: `0x${string}`, blockNumber: number) => {
      const bundle: BundleParams['body'] = [
        { tx: signedTransaction ?? '', canRevert: false },
      ];

      const bundleStatus = await axios.post('/api/simulate-bundle', {
        bundle,
        blockNumber,
        privateKey: pK,
      });

      return bundleStatus;
    },
    [signedTransaction],
  );

  // const sendBundle = useCallback(async () => {
  //   const bundleStatus = await axios.post('/api/send-bundle', {
  //     bundle,
  //     privateKey: pK,
  //   });
  // }, [signedTransaction]);

  const getBlockNumber = useCallback(async () => {
    return provider.getBlockNumber();
  }, [provider]);

  return { getSimulationResult, getBlockNumber, signedTransaction, nonce };
};
