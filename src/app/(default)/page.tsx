import { Metadata } from 'next';
import React from 'react';

import { RescueOptions } from '@/components/shared/rescue-options';
import { ScrollArea } from '@/components/ui/scroll-area';
import { rescueOptions } from '@/data/rescue-options';

export const metadata: Metadata = {
  title: 'RescueFi | Home',
};

const DashboardHome = () => {
  return (
    <ScrollArea className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 overflow-y-auto overflow-x-hidden md:h-full">
      <RescueOptions rescueOptions={rescueOptions} />
    </ScrollArea>
  );
};

export default DashboardHome;
