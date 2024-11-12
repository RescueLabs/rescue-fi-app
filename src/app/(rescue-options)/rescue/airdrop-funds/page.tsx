import { Metadata } from 'next';
import React from 'react';

import { AirdropStepForm } from '@/components/shared/step-form/airdrop-step-form';

export const metadata: Metadata = {
  title: 'RescueFi | Rescue airdrop funds',
};

const RescueAirdropFundsPage = () => {
  return (
    <div className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 md:h-full">
      <AirdropStepForm />
    </div>
  );
};

export default RescueAirdropFundsPage;
