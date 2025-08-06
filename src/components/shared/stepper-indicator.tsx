import { IconCheck } from '@tabler/icons-react';
import React, { FC, Fragment } from 'react';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface StepperIndicatorProps {
  steps: {
    label: string;
    number: number;
  }[];
  activeStep: number;
}

export const StepperIndicator: FC<StepperIndicatorProps> = ({
  activeStep,
  steps,
}) => (
  <div className="flex w-full max-w-[500px] items-center justify-center">
    {steps.map((step) => (
      <Fragment key={step.number}>
        <div className="relative flex flex-col items-center justify-center">
          <div
            className={cn(
              'm-[5px] flex h-8 w-8 items-center justify-center rounded-full border-[2px] sm:h-10 sm:w-10',
              step.number > activeStep &&
                'border-slate-800/50 bg-white text-in-black-300 dark:border-slate-200/50 dark:bg-in-black-300 dark:text-white',
              step.number < activeStep &&
                'border-purple-500 bg-purple-500 !text-white dark:border-purple-400 dark:bg-purple-500',
              step.number === activeStep &&
                'border-purple-500 dark:border-purple-400',
            )}
          >
            {step.number >= activeStep ? (
              step.number
            ) : (
              <IconCheck className="h-5 w-5" />
            )}
          </div>
          <span
            className={cn(
              'absolute left-1/2 top-12 min-w-24 -translate-x-1/2 text-center text-sm text-gray-600 dark:text-gray-400',
              {
                'text-in-black-300 dark:text-white': step.number <= activeStep,
              },
            )}
          >
            {step.label}
          </span>
        </div>
        {step.number !== steps.length && (
          <div className="flex h-[2px] w-[40px] items-center justify-center min-[350px]:w-[60px] sm:w-[100px]">
            <Separator
              orientation="horizontal"
              className={cn(
                'h-[2px] w-full origin-left bg-slate-800/50 transition-all duration-300 dark:bg-slate-200/50',
                step.number <= activeStep - 1 &&
                  'bg-purple-500 dark:bg-purple-500',
              )}
            />
          </div>
        )}
      </Fragment>
    ))}
  </div>
);
