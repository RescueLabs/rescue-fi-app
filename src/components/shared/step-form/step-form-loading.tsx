'use client';

import { Fragment } from 'react';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const StepFormLoading = () => {
  return (
    <div className="flex w-full flex-col items-center gap-y-10 px-3 py-20">
      <Skeleton className="h-8 w-48" />

      <div className="flex w-full max-w-[500px] items-center justify-center">
        {[1, 2, 3].map((step) => (
          <Fragment key={step}>
            <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />

            {step !== 3 && (
              <div className="flex h-[2px] w-[40px] items-center justify-center min-[350px]:w-[60px] sm:w-[100px]">
                <Separator
                  orientation="horizontal"
                  className={cn(
                    'h-[2px] w-full origin-left bg-slate-800/50 transition-all duration-300 dark:bg-slate-200/50',
                  )}
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <Card
        withBackground
        className="flex h-full w-full max-w-[600px] flex-col overflow-y-hidden px-4 py-4 md:py-8"
      >
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          <div className="flex flex-col gap-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </Card>

      <div className="flex justify-center space-x-[20px]">
        <Skeleton className="h-10 w-[100px] rounded-lg" />
        <Skeleton className="h-10 w-[100px] rounded-lg" />
      </div>
    </div>
  );
};
