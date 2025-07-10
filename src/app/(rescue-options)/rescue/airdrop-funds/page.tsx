import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'RescueFi | Rescue airdrop funds',
};

const AirdropStepForm = dynamic(
  () =>
    import('@/components/shared/step-form/test-airdrop-step-form').then(
      (mod) => mod.AirdropStepForm,
    ),
  {
    ssr: false,
  },
);

const RescueAirdropFundsPage = () => {
  return (
    <ScrollArea className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 overflow-y-auto overflow-x-hidden md:h-full">
      <Suspense fallback={null}>
        <AirdropStepForm />
      </Suspense>
    </ScrollArea>
  );
};

export default RescueAirdropFundsPage;
