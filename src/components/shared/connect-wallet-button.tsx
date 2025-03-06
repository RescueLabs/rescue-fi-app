'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/ui/button';

export const ConnectWalletButton = () => {
  const { connector, isConnected } = useAccount();

  const addCustomNetwork = async () => {
    const provider = await connector?.getProvider();

    await (provider as any).request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x10',
          chainName: 'Flashbots Protect',
          rpcUrls: ['https://rpc.flashbots.net/fast'],
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          blockExplorerUrls: ['https://etherscan.io'],
        },
      ],
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 pr-4 pt-4 md:pr-0 md:pt-0">
      <ConnectButton showBalance={false} />

      {isConnected && (
        <Button variant="outline" onClick={addCustomNetwork}>
          Add network
        </Button>
      )}
    </div>
  );
};
