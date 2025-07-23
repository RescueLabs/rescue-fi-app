import { cookieStorage, createConfig, createStorage, http } from 'wagmi';

import { CHAINS } from '@/constants';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const rawWalletConfig = {
  appName: 'RescueFi',
  projectId: process.env.WALLET_CONNECT_PROJECT_ID as string,
  chains: CHAINS,
  transports: {
    ...Object.fromEntries(CHAINS.map((chain) => [chain.id, http()])),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
};

export const config = createConfig(rawWalletConfig as any);
