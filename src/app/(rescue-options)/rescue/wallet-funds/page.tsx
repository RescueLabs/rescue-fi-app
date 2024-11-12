import { Metadata } from 'next';
import React from 'react';

import { WalletStepForm } from '@/components/shared/step-form/wallet-step-form';

export const metadata: Metadata = {
  title: 'RescueFi | Rescue wallet funds',
};

const RescueWalletFundsPage = () => {
  return (
    <div className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 md:h-full">
      <WalletStepForm />
    </div>
  );
};

export default RescueWalletFundsPage;
