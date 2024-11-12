import { Metadata } from 'next';
import React from 'react';

import { RescueOptions } from '@/components/shared/rescue-options';
import { rescueOptions } from '@/data/rescue-options';

export const metadata: Metadata = {
  title: 'RescueFi | Home',
};

const DashboardHome = () => {
  return (
    <div className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 md:h-full">
      <RescueOptions rescueOptions={rescueOptions} />
    </div>
  );
};

export default DashboardHome;
