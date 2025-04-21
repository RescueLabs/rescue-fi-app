import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RescueFi',
  projectId: process.env.WALLET_CONNECT_PROJECT_ID as string,
  chains: process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? [sepolia] : [mainnet],
  transports: {
    [mainnet.id]: http('https://rpc.flashbots.net/fast'),
    [sepolia.id]: http(),
  },
  ssr: true,
});
