'use client';

import React, { createContext, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';

import { useConnectedToFlashbotRpc } from '@/hooks/use-connected-to-flashbot-rpc';
import { ACCEPTED_CHAIN } from '@/lib/constants';

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
            chainName: 'RescueFi-Flashbots Protect',
            rpcUrls: [rpcUrl],
            nativeCurrency: ACCEPTED_CHAIN.nativeCurrency,
            blockExplorerUrls: [ACCEPTED_CHAIN.blockExplorers.default.url],
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
