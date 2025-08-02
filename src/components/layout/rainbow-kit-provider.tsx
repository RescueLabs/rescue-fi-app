'use client';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { FC, PropsWithChildren } from 'react';
import { cookieToInitialState, WagmiProvider } from 'wagmi';

import { config } from '@/configs/wallet';

import { AppQueryClientProvider } from './query-client-provider';

export const RainbowKitClientProvider: FC<
  PropsWithChildren<{
    cookie: string;
  }>
> = ({ children, cookie }) => {
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} {...(initialState ? { initialState } : {})}>
      <AppQueryClientProvider>
        <RainbowKitProvider
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
};
