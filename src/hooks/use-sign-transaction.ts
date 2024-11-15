import { useState, useEffect } from 'react';
import { Address, Hex, LocalAccount } from 'viem';

export const useSignTransaction = (
  account: LocalAccount,
  to: Address,
  value: bigint,
  nonce: number,
  gasPrice: bigint,
  data: Hex,
  gasLimit: bigint,
): Hex | undefined => {
  const [signedTransaction, setSignedTransaction] = useState<Hex | undefined>(
    undefined,
  );

  useEffect(() => {
    (async () => {
      const _signedTransaction = await account.signTransaction({
        to,
        value,
        nonce,
        gasPrice,
        data,
        chainId: 11155111,
        gas: gasLimit,
      });
      setSignedTransaction(_signedTransaction);
    })();
  }, [nonce, gasPrice, account, to, value, data, gasLimit]);

  return signedTransaction;
};
