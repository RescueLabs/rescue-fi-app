import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { LocalAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

export const useWalletNonce = (account: LocalAccount) => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const [nonce, setNonce] = useState<number | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const _nonce = await publicClient.getTransactionCount({
        address: account.address,
      });
      setNonce(_nonce);
    })();
  });

  return nonce;
};
