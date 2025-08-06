import React from 'react';

import { cn } from '@/lib/utils';

import { ScrollArea } from '../ui/scroll-area';

export const ScrollAreaWithMobileContraints = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <ScrollArea
      className={cn(
        'mx-auto mt-1 flex h-[calc(100dvh-140px)] w-[95%] flex-col gap-y-7 overflow-y-auto overflow-x-hidden rounded-xl px-2 md:mt-0 md:h-full md:w-full',
        className,
      )}
    >
      {children}
    </ScrollArea>
  );
};
