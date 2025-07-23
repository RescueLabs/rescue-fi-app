'use client';

import React, { createContext, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';

import { ACCEPTED_CHAIN, CHAIN_ID } from '@/constants';
import { useConnectedToFlashbotRpc } from '@/hooks/use-connected-to-flashbot-rpc';

export const RpcEnforcerContext = createContext<{
  checkIfConnectedtoFlashbotRpc: () => Promise<boolean>;
  addCustomNetwork: (rpcUrl: string) => Promise<void>;
}>({
  checkIfConnectedtoFlashbotRpc: () => Promise.resolve(false),
  addCustomNetwork: (rpcUrl: string) => Promise.resolve(),
});

export const RpcEnforcerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { checkIfConnectedtoFlashbotRpc } = useConnectedToFlashbotRpc();
  const { connector } = useAccount();

  const addCustomNetwork = useCallback(
    async (rpcUrl: string) => {
      const provider = await connector?.getProvider();

      await (provider as any).request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId:
              process.env.NEXT_PUBLIC_NETWORK === 'sepolia'
                ? '0xaa36a7'
                : '0x1',
            chainName: ACCEPTED_CHAIN[CHAIN_ID].name,
            rpcUrls: [rpcUrl],
            nativeCurrency: ACCEPTED_CHAIN[CHAIN_ID].nativeCurrency,
            blockExplorerUrls: [
              ACCEPTED_CHAIN[CHAIN_ID].blockExplorers.default.url,
            ],
          },
        ],
      });
    },
    [connector],
  );

  const providerState = useMemo(
    () => ({ checkIfConnectedtoFlashbotRpc, addCustomNetwork }),
    [checkIfConnectedtoFlashbotRpc, addCustomNetwork],
  );

  return (
    <RpcEnforcerContext.Provider value={providerState}>
      {children}
    </RpcEnforcerContext.Provider>
  );
};
