import React from 'react';

import { FaqsLoading } from '@/components/shared/faqs-loading';
import { ScrollArea } from '@/components/ui/scroll-area';

const Loading = () => {
  return (
    <ScrollArea className="flex h-[calc(100dvh-60px)] w-full flex-col gap-y-7 overflow-y-auto overflow-x-hidden md:h-full">
      <section className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-y-20 px-3 py-10">
        <FaqsLoading />
      </section>
    </ScrollArea>
  );
};

export default Loading;
