import { IconAirBalloon, IconWallet } from '@tabler/icons-react';

export interface RescueOptionType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

export const rescueOptions: RescueOptionType[] = [
  {
    id: '1',
    title: 'Wallet Funds',
    description: 'Option to rescue funds from your wallet.',
    icon: (
      <IconWallet className="size-[22px] min-w-[22px] self-start text-purple-600 dark:text-purple-200" />
    ),
    href: '/rescue/wallet-funds',
  },
  {
    id: '2',
    title: 'Airdrop Funds',
    description: 'Option to rescue airdrop funds.',
    icon: (
      <IconAirBalloon className="size-[22px] min-w-[22px] self-start text-purple-600 dark:text-purple-200" />
    ),
    href: '/rescue/airdrop-funds',
  },
];