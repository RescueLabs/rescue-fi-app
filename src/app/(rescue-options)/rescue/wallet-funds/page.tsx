import { Metadata } from 'next';
import React from 'react';

import { TestWalletStepForm } from '@/components/shared/step-form/test-wallet-step-form';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'RescueFi | Rescue wallet funds',
};

const RescueWalletFundsPage = () => {
  return (
    <ScrollArea className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 overflow-y-auto overflow-x-hidden md:h-full">
      <TestWalletStepForm />
    </ScrollArea>
  );
};

export default RescueWalletFundsPage;
