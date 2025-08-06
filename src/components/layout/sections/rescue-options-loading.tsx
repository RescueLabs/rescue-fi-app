'use client';

import React from 'react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const RescueOptionsLoading = () => {
  return (
    <Card
      withBackground={false}
      className="mb-3 flex flex-col px-2 py-8 md:py-12"
    >
      <div className="mb-8 flex flex-col items-center gap-y-10">
        <Skeleton className="h-20 w-20 rounded-full" />

        <div className="w-full space-y-2 px-6 text-center">
          <Skeleton className="mx-auto h-8 w-32" />
          <Skeleton className="mx-auto h-8 w-96" />
        </div>
      </div>

      <div className="mb-12 flex w-full flex-col items-center gap-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex w-full max-w-[600px] items-center gap-4 rounded-md bg-white p-4 dark:bg-in-black-300"
          >
            <Skeleton className="h-10 w-10 rounded-md" />

            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>

            <Skeleton className="h-8 w-20 rounded-2xl" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </Card>
  );
};
