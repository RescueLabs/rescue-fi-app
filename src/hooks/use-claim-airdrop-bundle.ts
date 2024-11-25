import { BundleParams } from '@flashbots/mev-share-client';
import { ISendBundleResult } from '@flashbots/mev-share-client/build/api/interfaces';
import axios from 'axios';
import { ethers, Interface, keccak256 } from 'ethers';
import { useCallback } from 'react';
import { privateKeyToAccount } from 'viem/accounts';

import { MAX_BLOCK_NUMBER, SEPOLIA_CHAIN_ID } from '@/lib/constants';

import { getPublicClient } from '../lib/utils';

import { useWatchBundle } from './use-watch-bundle';

const erc20Interface = new Interface([
  'function transfer(address to, uint256 value) public returns (bool)',
]);

const publicClient = getPublicClient();

export const useClaimAirdropBundle = ({
  victimPrivateKey,
  rescuerPrivateKey,
  receiverAddress,
  tokenAddress,
  airdropContractAddress,
  data,
  amount,
  txGases,
  gasPrice,
  gas,
}: {
  victimPrivateKey: `0x${string}`;
  rescuerPrivateKey: `0x${string}`;
  receiverAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  data: `0x${string}`;
  airdropContractAddress: `0x${string}`;
  amount: bigint;
  gasPrice: bigint;
  gas: bigint;
  txGases: bigint[];
}) => {
  const {
    loading,
    setLoading,
    watchBundle,
    success,
    failed,
    setSuccess,
    setFailed,
  } = useWatchBundle();

  const victimAccount = privateKeyToAccount(victimPrivateKey);
  const rescuerAccount = privateKeyToAccount(rescuerPrivateKey);

  const sendBundle = useCallback(async () => {
    setLoading(true);
    setSuccess(false);
    setFailed(false);
    const victimNonce = await publicClient.getTransactionCount({
      address: victimAccount.address,
    });
    const rescuerNonce = await publicClient.getTransactionCount({
      address: rescuerAccount.address,
    });

    // transaction to send ETH to victim wallet for gas

    const signedTransaction1 = await rescuerAccount.signTransaction({
      to: victimAccount.address,
      value: (gas - BigInt(21000)) * gasPrice,
      nonce: rescuerNonce,
      gasPrice,
      gas: BigInt(21000),
      data: '0x' as `0x${string}`,
      chainId: SEPOLIA_CHAIN_ID,
    });
    console.log('tx1', {
      to: victimAccount.address,
      value: (gas - BigInt(21000)) * gasPrice,
      nonce: rescuerNonce,
      gasPrice,
      gas: BigInt(21000),
      data: '0x' as `0x${string}`,
    });
    let etherTx = ethers.Transaction.from(signedTransaction1);
    const txHash1 = keccak256(etherTx.serialized);

    // transaction to claim airdrop
    const signedTransaction2 = await victimAccount.signTransaction({
      to: airdropContractAddress,
      value: BigInt(0),
      nonce: victimNonce,
      gasPrice,
      data,
      gas: txGases[1],
    });
    console.log('tx2', {
      to: airdropContractAddress,
      value: BigInt(0),
      nonce: victimNonce,
      gasPrice,
      data,
      gas: txGases[1],
    });
    etherTx = ethers.Transaction.from(signedTransaction2);
    const txHash2 = keccak256(etherTx.serialized);

    // transaction to send token to receiver
    const signedTransaction3 = await victimAccount.signTransaction({
      to: tokenAddress,
      value: BigInt(0),
      nonce: victimNonce + 1,
      gasPrice,
      data: erc20Interface.encodeFunctionData('transfer', [
        receiverAddress,
        amount,
      ]) as `0x${string}`,
      gas: txGases[2],
    });
    console.log('tx3', {
      to: tokenAddress,
      value: BigInt(0),
      nonce: victimNonce + 1,
      gasPrice,
      data: erc20Interface.encodeFunctionData('transfer', [
        receiverAddress,
        amount,
      ]) as `0x${string}`,
      gas: txGases[2],
    });
    etherTx = ethers.Transaction.from(signedTransaction3);
    const txHash3 = keccak256(etherTx.serialized);

    const bundle: BundleParams['body'] = [
      { tx: signedTransaction1 ?? '', canRevert: false },
      { tx: signedTransaction2 ?? '', canRevert: false },
      { tx: signedTransaction3 ?? '', canRevert: false },
    ];
    const blockNumber = await publicClient.getBlockNumber();
    let bundleResult: ISendBundleResult;
    try {
      bundleResult = (
        await axios.post('/api/send-bundle', {
          bundle,
          blockNumber: String(blockNumber),
        })
      ).data.data;
    } catch (error) {
      console.log('ClaimAirdropBundleError', error);
      setFailed(true);
      setLoading(false);
      bundleResult = { bundleHash: '' };
    }

    return {
      bundleHash: bundleResult.bundleHash,
      txHashes: [txHash1, txHash2, txHash3],
      bundle,
      maxBlockNumber: blockNumber + BigInt(MAX_BLOCK_NUMBER),
    };
  }, [
    victimAccount,
    rescuerAccount,
    gas,
    gasPrice,
    airdropContractAddress,
    data,
    txGases,
    tokenAddress,
    receiverAddress,
    amount,
    rescuerPrivateKey,
  ]);

  return { sendBundle, loading, success, failed, watchBundle };
};
