'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useLocalStorage } from 'usehooks-ts';

import { StepperIndicator } from '@/components/shared/stepper-indicator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StageContext } from '@/context/stage-context';
import { STORAGE_KEYS } from '@/lib/constants';
import { StepperFormValues } from '@/types/hook-stepper';
import { ITokenMetadata } from '@/types/tokens';

import { ConnectSignTransactions } from './connect-sign-transactions';
import { SendFinalBundle } from './send-final-bundle';
import { WalletsInfo } from './wallets-info';

const getStepContent = (step: number) => {
  switch (step) {
    case 1:
      return <WalletsInfo />;
    case 2:
      return <ConnectSignTransactions />;
    case 3:
      return <SendFinalBundle />;
    default:
      return 'Unknown step';
  }
};

export const TestWalletStepForm = () => {
  const [selectedTokens] = useLocalStorage<Record<string, ITokenMetadata>>(
    STORAGE_KEYS.selectedTokens,
    {},
  );
  const [_v, setVictimAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.victimAddress,
    null,
  );
  const [_r, setReceiverAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.receiverAddress,
    null,
  );

  const [activeStep, setActiveStep] = useState<number>(1);
  const [erroredInputName, setErroredInputName] = useState<string>('');

  const methods = useForm<StepperFormValues>({
    mode: 'onChange',
  });

  const {
    formState: { isValid },
  } = methods;

  const [victimWalletAddress, receiverWalletAddress] = useWatch({
    control: methods.control,
    name: ['victimWalletAddress', 'receiverWalletAddress'],
  });

  const isNextDisabled = useMemo(() => {
    switch (activeStep) {
      case 1:
        return !isValid || Object.keys(selectedTokens).length === 0;
      default:
        return false;
    }
  }, [activeStep, isValid, selectedTokens]);

  const handleNext = useCallback(() => {
    if (
      (isValid && activeStep === 1 && Object.keys(selectedTokens).length > 0) ||
      (isValid && activeStep === 2)
    ) {
      if (activeStep === 1) {
        setVictimAddress(victimWalletAddress);
        setReceiverAddress(receiverWalletAddress);
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isValid,
    activeStep,
    selectedTokens,
    victimWalletAddress,
    receiverWalletAddress,
  ]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const contextValue = useMemo(
    () => ({
      setStage: setActiveStep,
    }),
    [setActiveStep],
  );

  // focus errored input on submit
  useEffect(() => {
    const erroredInputElement =
      document.getElementsByName(erroredInputName)?.[0];
    if (erroredInputElement instanceof HTMLInputElement) {
      erroredInputElement.focus();
      setErroredInputName('');
    }
  }, [erroredInputName]);

  return (
    <StageContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        <div className="flex w-full flex-col items-center gap-y-10 px-3 py-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-semibold"
          >
            Rescue Wallet Funds
          </motion.p>

          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <StepperIndicator activeStep={activeStep} steps={[1, 2, 3]} />
          </motion.div>

          <FormProvider {...methods}>
            <form
              noValidate
              className="flex w-full flex-col items-center gap-y-10"
            >
              <Card
                withBackground
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delayChildren: 0.5 }}
                className="flex h-full w-full max-w-[600px] flex-col overflow-y-hidden px-4 py-4 md:py-8"
              >
                {getStepContent(activeStep)}
              </Card>

              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center space-x-[20px]"
              >
                {activeStep !== 3 && (
                  <Button
                    type="button"
                    className="w-[100px]"
                    variant="outline"
                    onClick={handleBack}
                    disabled={activeStep === 1}
                  >
                    Back
                  </Button>
                )}

                {activeStep === 1 && (
                  <Button
                    type="button"
                    className="w-[100px]"
                    disabled={isNextDisabled}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </motion.div>
            </form>
          </FormProvider>
        </div>
      </AnimatePresence>
    </StageContext.Provider>
  );
};
