'use client';

import { Check, Loader as LucideLoader } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type FormRescueFundsLoadingStatus = 'loading' | 'success' | 'error';

type StepStatus = 'pending' | 'active' | 'completed';

interface Step {
  id: string;
  message: string;
  status: StepStatus;
}

const RESCUE_STEPS = [
  {
    id: '1',
    message: 'Initializing rescue protocol',
    status: 'pending' as StepStatus,
  },
  {
    id: '2',
    message: 'Analyzing wallet vulnerabilities',
    status: 'pending' as StepStatus,
  },
  {
    id: '3',
    message: 'Preparing secure transaction bundle',
    status: 'pending' as StepStatus,
  },
  {
    id: '4',
    message: 'Validating rescue parameters',
    status: 'pending' as StepStatus,
  },
  {
    id: '5',
    message: 'Executing fund recovery',
    status: 'pending' as StepStatus,
  },
  {
    id: '6',
    message: 'Confirming transaction success',
    status: 'pending' as StepStatus,
  },
];

export const FormRescueFundsLoading = ({
  formRescueFundsLoadingStatus,
  tryAgain,
  balanceUrl,
}: {
  formRescueFundsLoadingStatus: FormRescueFundsLoadingStatus;
  tryAgain?: () => void;
  balanceUrl?: string;
}) => {
  const [steps, setSteps] = useState<Step[]>(RESCUE_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [shouldCompleteSteps, setShouldCompleteSteps] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle step progression
  useEffect(() => {
    if (formRescueFundsLoadingStatus === 'loading') {
      // Start the step progression
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;

          // Update step statuses
          setSteps((prevSteps) =>
            prevSteps.map((step, index) => ({
              ...step,
              status:
                index < prevIndex
                  ? 'completed'
                  : index === prevIndex
                    ? 'active'
                    : 'pending',
            })),
          );

          // If we've reached the last step, stop progressing
          if (nextIndex >= RESCUE_STEPS.length) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return prevIndex; // Stay on last step
          }

          return nextIndex;
        });
      }, 2000); // 2 seconds per step
    } else if (
      formRescueFundsLoadingStatus === 'success' &&
      intervalRef.current
    ) {
      // If loading finished, complete remaining steps quickly
      setShouldCompleteSteps(true);
      clearInterval(intervalRef.current);
    } else if (
      formRescueFundsLoadingStatus === 'error' &&
      intervalRef.current
    ) {
      // Clear interval on error
      clearInterval(intervalRef.current);
      setCurrentStepIndex(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [formRescueFundsLoadingStatus]);

  // Handle completing remaining steps on success
  useEffect(() => {
    if (shouldCompleteSteps) {
      const completeRemainingSteps = () => {
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            status: 'completed' as StepStatus,
          })),
        );
        setCurrentStepIndex(RESCUE_STEPS.length);
      };

      // Small delay to show completion animation
      const timeout = setTimeout(completeRemainingSteps, 500);
      return () => clearTimeout(timeout);
    }
  }, [shouldCompleteSteps]);

  // Initialize first step as active
  useEffect(() => {
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'active' : 'pending',
      })),
    );
  }, []);

  // Show error state immediately
  if (formRescueFundsLoadingStatus === 'error') {
    return (
      <div className="flex w-full max-w-[600px] flex-col items-center gap-y-2">
        <div className="w-full rounded-lg p-4">
          <div className="mb-2 flex items-center justify-center space-x-3 text-red-500">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <span className="text-sm font-bold text-white">!</span>
            </div>
            <h3 className="text-2xl font-semibold">Rescue Failed</h3>
          </div>
          <div className="text-center">
            <p className="text-base text-gray-600 dark:text-gray-400">
              Error occurred during the rescue process
            </p>
          </div>
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                tryAgain?.();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (
    formRescueFundsLoadingStatus === 'success' &&
    shouldCompleteSteps &&
    currentStepIndex >= RESCUE_STEPS.length
  ) {
    return (
      <div className="flex w-full max-w-[600px] flex-col items-center gap-y-2">
        <div className="w-full rounded-lg p-4">
          <div className="mb-2 flex items-center justify-center space-x-3 text-green-500">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <Check className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-2xl font-semibold">Rescue Successful</h3>
          </div>
          <div className="text-center">
            <p className="text-base text-gray-600 dark:text-gray-400">
              Funds have been successfully secured
            </p>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline">Go to Home</Button>
            </Link>
            {balanceUrl && (
              <Link href={balanceUrl} target="_blank" rel="noreferrer">
                <Button
                  variant="outline"
                  className="pointer-events-none border border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  View Balance
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state with steps
  return (
    <div className="flex w-full max-w-[600px] flex-col items-center gap-y-4">
      <div className="w-full">
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300',
                step.status === 'active'
                  ? 'bg-primary/5 text-primary dark:bg-primary/10 font-semibold'
                  : step.status === 'completed'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'text-muted-foreground',
                index === steps.length - 1 && 'animate-slide-up',
              )}
            >
              <div className="border-muted-foreground/20 flex h-6 w-6 items-center justify-center rounded-full border bg-white dark:bg-gray-900">
                {step.status === 'completed' ? (
                  <div className="animate-bounce-in flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-4 w-4 min-w-4 text-white" />
                  </div>
                ) : step.status === 'active' ? (
                  <LucideLoader className="text-primary h-4 w-4 min-w-4 animate-spin" />
                ) : (
                  <div className="bg-muted-foreground/30 h-2 w-2 min-w-2 rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  'truncate',
                  step.status === 'active' ? 'animate-pulse' : '',
                )}
              >
                {step.message}
                {step.status === 'active' && (
                  <span className="ml-1 inline-block align-middle">
                    <span className="mx-0.5 inline-block h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0s]" />
                    <span className="mx-0.5 inline-block h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0.2s]" />
                    <span className="mx-0.5 inline-block h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0.4s]" />
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
