import { BundleParams } from '@flashbots/mev-share-client';
import { ISendBundleResult } from '@flashbots/mev-share-client/build/api/interfaces';
import axios from 'axios';
import { ethers, keccak256 } from 'ethers';
import { useCallback } from 'react';

import {
  MAX_BLOCK_NUMBER,
  ZERO_ADDRESS,
  CHAIN_ID,
  ERC20_INTERFACE,
} from '@/constants';

import {
  getPrivateKeyAccount,
  getPublicClient,
  validateTokenAddress,
} from '../lib/utils';

import { useWatchBundle } from './use-watch-bundle';

const publicClient = getPublicClient();

export const useRescueTokenBundle = () => {
  const {
    loading,
    setLoading,
    watchBundle,
    success,
    failed,
    setSuccess,
    setFailed,
  } = useWatchBundle();

  const sendBundle = useCallback(
    async ({
      victimPrivateKey,
      rescuerPrivateKey,
      receiverAddress,
      tokenAddress,
      amount,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gas,
    }: {
      victimPrivateKey: `0x${string}`;
      rescuerPrivateKey: `0x${string}`;
      receiverAddress: `0x${string}`;
      tokenAddress: `0x${string}`;
      amount: bigint;
      maxFeePerGas: bigint;
      maxPriorityFeePerGas: bigint;
      gas: bigint;
    }) => {
      const victimAccount = getPrivateKeyAccount(victimPrivateKey);
      const rescuerAccount = getPrivateKeyAccount(rescuerPrivateKey);

      if (
        !victimAccount ||
        !rescuerAccount ||
        !validateTokenAddress(tokenAddress) ||
        !validateTokenAddress(receiverAddress)
      ) {
        setFailed(true);
        setLoading(false);
        return {};
      }

      setLoading(true);
      setSuccess(false);
      setFailed(false);
      const victimNonce = await publicClient.getTransactionCount({
        address: victimAccount?.address ?? ZERO_ADDRESS,
      });
      const rescuerNonce = await publicClient.getTransactionCount({
        address: rescuerAccount?.address ?? ZERO_ADDRESS,
      });

      // transaction to send ETH to victim wallet for gas
      const signedTransaction1 = await rescuerAccount?.signTransaction({
        to: victimAccount?.address ?? ZERO_ADDRESS,
        value: (gas - BigInt(21000)) * maxFeePerGas,
        nonce: rescuerNonce,
        maxFeePerGas,
        maxPriorityFeePerGas,
        gas: BigInt(21000),
        data: '0x' as `0x${string}`,
        chainId: CHAIN_ID,
      });
      let etherTx = ethers.Transaction.from(signedTransaction1);
      const txHash1 = keccak256(etherTx.serialized);

      // transaction to send token to receiver
      const signedTransaction2 = await victimAccount?.signTransaction({
        to: tokenAddress,
        value: BigInt(0),
        nonce: victimNonce,
        maxFeePerGas,
        maxPriorityFeePerGas,
        data: ERC20_INTERFACE.encodeFunctionData('transfer', [
          receiverAddress,
          amount,
        ]) as `0x${string}`,
        gas: gas - BigInt(21000),
        chainId: CHAIN_ID,
      });

      etherTx = ethers.Transaction.from(signedTransaction2);
      const txHash2 = keccak256(etherTx.serialized);

      const bundle: BundleParams['body'] = [
        { tx: signedTransaction1 ?? '', canRevert: false },
        { tx: signedTransaction2 ?? '', canRevert: false },
      ];

      const blockNumber = await publicClient.getBlockNumber();

      const bundleResult: ISendBundleResult = (
        await axios.post('/api/send-bundle', {
          bundle,
          blockNumber: String(blockNumber),
          privateKey: rescuerPrivateKey,
        })
      ).data.data;

      return {
        bundleHash: bundleResult.bundleHash,
        txHashes: [txHash1, txHash2],
        bundle,
        maxBlockNumber: blockNumber + BigInt(MAX_BLOCK_NUMBER),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { sendBundle, loading, success, failed, watchBundle };
};
