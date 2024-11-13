import { Metadata } from 'next';
import React from 'react';

import { AirdropStepForm } from '@/components/shared/step-form/airdrop-step-form';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'RescueFi | Rescue airdrop funds',
};

const RescueAirdropFundsPage = () => {
  return (
    <ScrollArea className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 overflow-y-auto overflow-x-hidden md:h-full">
      <AirdropStepForm />
    </ScrollArea>
  );
};

export default RescueAirdropFundsPage;
