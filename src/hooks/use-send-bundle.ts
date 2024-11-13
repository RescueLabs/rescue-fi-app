import { privateKeyToAccount } from 'viem/accounts';

import { useGasPrice } from './use-gas-Price';
import { useSignTransaction } from './use-sign-transaction';
import { useWalletNonce } from './use-wallet-nonce';

export const useSendBundle = (privateKey: `0x${string}`) => {
  const account = privateKeyToAccount(privateKey);

  const { gasPrice } = useGasPrice();

  const to = '0x0000000000000000000000000000000000000000';
  const value = BigInt(1000000000000000000);
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

  console.log(signedTransaction, nonce, gasPrice);
};
