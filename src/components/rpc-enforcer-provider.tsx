'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAccount } from 'wagmi';

import { useConnectedToFlashbotRpc } from '@/hooks/use-connected-to-flashbot-rpc';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const RpcEnforcerContext = createContext<{
  showRpcEnforcerIfNotConnected: () => void;
}>({
  showRpcEnforcerIfNotConnected: () => {},
});

export const RpcEnforcerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showRpcEnforcer, setShowRpcEnforcer] = useState<boolean>(false);

  const { checkIfConnectedtoFlashbotRpc } = useConnectedToFlashbotRpc();
  const { connector, isConnected } = useAccount();

  const [_, copy] = useCopyToClipboard();

  const showRpcEnforcerIfNotConnected = useCallback(async () => {
    const isConnectedToFlashbotRpc = await checkIfConnectedtoFlashbotRpc();

    setShowRpcEnforcer(!isConnectedToFlashbotRpc);
  }, [checkIfConnectedtoFlashbotRpc]);

  const addCustomNetwork = useCallback(async () => {
    const provider = await connector?.getProvider();

    await (provider as any).request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x1',
          chainName: 'Flashbots Protect',
          rpcUrls: ['https://rpc.flashbots.net/fast?bundle=1d43'],
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          blockExplorerUrls: ['https://etherscan.io'],
        },
      ],
    });
  }, [connector]);

  const providerState = useMemo(
    () => ({ showRpcEnforcerIfNotConnected }),
    [showRpcEnforcerIfNotConnected],
  );

  useEffect(() => {
    if (isConnected) {
      showRpcEnforcerIfNotConnected();
    }
  }, [isConnected, showRpcEnforcerIfNotConnected]);

  return (
    <RpcEnforcerContext.Provider value={providerState}>
      {children}

      {showRpcEnforcer && isConnected && (
        <Dialog open={showRpcEnforcer} onOpenChange={() => {}}>
          <DialogContent noCloseIcon>
            <DialogHeader>
              <DialogTitle className="mb-4">
                Connect to Flashbots Protect
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-center">
              You&apos;re currently not connected to a flashbots RPC url. This
              enables you to use the flashbots protect service. You can{' '}
              <Button
                variant="link"
                onClick={addCustomNetwork}
                className="display-inline hover:text-underline border-none !text-purple-500 focus:outline-none focus:!ring-0"
              >
                add it automatically
              </Button>
              to your network.
            </DialogDescription>
            <DialogDescription className="text-center text-white">
              <span className="flex flex-col gap-2">
                If adding automatically does not work, or you see this modal
                again, please follow the video steps below to add the rpc url
                manually to your wallet:
                <span className="flex justify-center">
                  <span
                    className="block w-fit cursor-pointer rounded-md bg-purple-500 bg-opacity-20 px-2 py-0.5 text-xs text-purple-500"
                    onClick={() =>
                      copy('https://rpc.flashbots.net/fast?bundle=1d43')
                    }
                  >
                    https://rpc.flashbots.net/fast?bundle=1d43
                  </span>
                </span>
              </span>

              {/* TODO: Add video */}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}
    </RpcEnforcerContext.Provider>
  );
};
