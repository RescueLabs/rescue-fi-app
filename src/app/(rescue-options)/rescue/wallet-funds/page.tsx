import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'RescueFi | Rescue wallet funds',
};

const TestWalletStepForm = dynamic(
  () =>
    import('@/components/shared/step-form/test-wallet-step-form').then(
      (mod) => mod.TestWalletStepForm,
    ),
  {
    ssr: false,
  },
);

const RescueWalletFundsPage = () => {
  return (
    <ScrollArea className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 overflow-y-auto overflow-x-hidden md:h-full">
      <Suspense fallback={null}>
        <TestWalletStepForm />
      </Suspense>
    </ScrollArea>
  );
};

export default RescueWalletFundsPage;
