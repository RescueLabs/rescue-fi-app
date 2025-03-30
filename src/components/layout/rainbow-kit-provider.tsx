'use client';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { FC, PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';

import { config, flashbotsProtect } from '@/configs/wallet';

import { AppQueryClientProvider } from './query-client-provider';

export const RainbowKitClientProvider: FC<PropsWithChildren<{}>> = ({
  children,
}) => (
  <WagmiProvider config={config}>
    <AppQueryClientProvider>
      <RainbowKitProvider
        initialChain={flashbotsProtect}
        theme={darkTheme({
          accentColor: '#7b3fe4',
          accentColorForeground: 'white',
          borderRadius: 'large',
          fontStack: 'system',
          overlayBlur: 'large',
        })}
      >
        {children}
      </RainbowKitProvider>
    </AppQueryClientProvider>
  </WagmiProvider>
);
