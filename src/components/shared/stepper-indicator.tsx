import { IconCheck } from '@tabler/icons-react';
import clsx from 'clsx';
import React, { FC, Fragment } from 'react';

import { Separator } from '@/components/ui/separator';

interface StepperIndicatorProps {
  steps: number[];
  activeStep: number;
}

export const StepperIndicator: FC<StepperIndicatorProps> = ({
  activeStep,
  steps,
}) => {
  return (
    <div className="flex w-full max-w-[500px] items-center justify-center">
      {steps.map((step) => (
        <Fragment key={step}>
          <div
            className={clsx(
              'm-[5px] flex h-8 w-8 items-center justify-center rounded-full border-[2px] sm:h-10 sm:w-10',
              step > activeStep &&
                'border-slate-800/50 bg-white text-in-black-300 dark:border-slate-200/50 dark:bg-in-black-300 dark:text-white',
              step < activeStep &&
                'border-purple-500 bg-purple-500 !text-white dark:border-purple-400 dark:bg-purple-500',
              step === activeStep && 'border-purple-500 dark:border-purple-400',
            )}
          >
            {step >= activeStep ? step : <IconCheck className="h-5 w-5" />}
          </div>
          {step !== steps.length && (
            <div className="flex h-[2px] w-[40px] items-center justify-center min-[350px]:w-[60px] sm:w-[100px]">
              <Separator
                orientation="horizontal"
                className={clsx(
                  'h-[2px] w-full origin-left bg-slate-800/50 transition-all duration-300 dark:bg-slate-200/50',
                  step <= activeStep - 1 && 'bg-purple-500 dark:bg-purple-500',
                )}
              />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
};
