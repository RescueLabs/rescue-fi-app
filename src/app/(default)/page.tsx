import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

import { RescueOptionsLoading } from '@/components/shared/rescue-options-loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { rescueOptions } from '@/data/rescue-options';

export const metadata: Metadata = {
  title: 'RescueFi | Home',
};

const RescueOptions = dynamic(
  () =>
    import('@/components/shared/rescue-options').then(
      (mod) => mod.RescueOptions,
    ),
  {
    ssr: false,
  },
);

const DashboardHome = () => {
  return (
    <Suspense fallback={<RescueOptionsLoading />}>
      <ScrollArea className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 overflow-y-auto overflow-x-hidden md:h-full">
        <RescueOptions rescueOptions={rescueOptions} />
      </ScrollArea>
    </Suspense>
  );
};

export default DashboardHome;
