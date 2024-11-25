'use client';

import { BundleParams } from '@flashbots/mev-share-client';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { IconLoader2 } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { StepperIndicator } from '@/components/shared/stepper-indicator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEstimateRescueTokenGas } from '@/hooks/use-estimate-rescue-token-gas';
import { useRescueTokenBundle } from '@/hooks/use-rescue-token-bundle';
import { useSimulateBundle } from '@/hooks/use-simulate-bundle';
import {
  SEPOLIA_RECEIVER_ADDRESS,
  SEPOLIA_RESCUER_PRIVATE_KEY,
  SEPOLIA_TOKEN_ADDRESS,
  SEPOLIA_VICTIM_PRIVATE_KEY,
} from '@/lib/constants';
import { WALLET_STEPPER_FORM_KEYS } from '@/lib/constants/hook-stepper-constants';
import { StepperFormKeysType, StepperFormValues } from '@/types/hook-stepper';

import {
  FormRescueFundsLoading,
  FormRescueFundsLoadingStatus,
} from './form-rescue-funds-loading';
import { RescueWalletInfo } from './rescue-wallet-info';
import { VictimWalletInfo } from './victim-wallet-info';

const getStepContent = (step: number) => {
  switch (step) {
    case 1:
      return <VictimWalletInfo />;
    case 2:
      return <RescueWalletInfo />;
    default:
      return 'Unknown step';
  }
};

export const WalletStepForm = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [erroredInputName, setErroredInputName] = useState<string>('');
  const [formRescueFundsLoadingStatus, setFormRescueFundsLoadingStatus] =
    useState<FormRescueFundsLoadingStatus>('loading');
  const methods = useForm<StepperFormValues>({
    mode: 'onChange',
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, isValid },
  } = methods;

  // focus errored input on submit
  useEffect(() => {
    const erroredInputElement =
      document.getElementsByName(erroredInputName)?.[0];
    if (erroredInputElement instanceof HTMLInputElement) {
      erroredInputElement.focus();
      setErroredInputName('');
    }
  }, [erroredInputName]);

  const onSubmit = async (formData: StepperFormValues) => {
    try {
      setActiveStep(3);

      // simulate api call
      const response: { title: string; description: string } =
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // resolve({
            //   title: "Success",
            //   description: "Form submitted successfully",
            // });
            reject(
              new Error('There was an error submitting form', {
                cause: {
                  errorKey: 'fullName',
                },
              }),
            );
          }, 2000);
        });

      toast.success(
        <p>
          Title: {response.title}
          <br />
          Description: {response.description}
        </p>,
      );

      setFormRescueFundsLoadingStatus('success');
    } catch (error: any) {
      const errorMessage = error.message;
      const errorKey = error.cause?.errorKey;

      toast.error(errorMessage);
      setFormRescueFundsLoadingStatus('error');

      if (
        errorKey &&
        Object.values(WALLET_STEPPER_FORM_KEYS)
          .flatMap((fieldNames) => fieldNames)
          .includes(errorKey)
      ) {
        let erroredStep: number;
        // get the step number based on input name
        Object.entries(WALLET_STEPPER_FORM_KEYS).forEach(([key, value]) => {
          if (value.includes(errorKey as never)) {
            erroredStep = Number(key);
          }
        });
        // set active step and error
        // @ts-ignore
        setActiveStep(erroredStep);
        setError(errorKey as StepperFormKeysType, {
          message: errorMessage,
        });
        setErroredInputName(errorKey);
      } else {
        setError('root.formError', {
          message: errorMessage,
        });
      }
    }
  };

  const handleNext = async () => {
    if (isValid) setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const { simulateBundle } = useSimulateBundle();

  const estimateRescueTokenGas = useEstimateRescueTokenGas(
    SEPOLIA_TOKEN_ADDRESS,
  );
  const [gas, setGas] = useState<{
    gas: bigint;
    gasPrice: bigint;
    gasInWei: bigint;
  }>();

  const { sendBundle, loading, success, failed, watchBundle } =
    useRescueTokenBundle({
      victimPrivateKey: SEPOLIA_VICTIM_PRIVATE_KEY,
      rescuerPrivateKey: SEPOLIA_RESCUER_PRIVATE_KEY,
      receiverAddress: SEPOLIA_RECEIVER_ADDRESS,
      tokenAddress: SEPOLIA_TOKEN_ADDRESS,
      amount: BigInt('1000000000000000000'),
      gasPrice: gas?.gasPrice ?? BigInt(0),
      gas: gas?.gas ?? BigInt(0),
    });

  useEffect(() => {
    const calculateGas = async () => {
      const { gas: _gas, gasPrice, gasInWei } = await estimateRescueTokenGas();
      setGas({ gas: _gas + BigInt(21000), gasPrice, gasInWei }); // 21000 is the gas for sending the gas to victim
    };
    calculateGas();
  }, [estimateRescueTokenGas]);

  useEffect(() => {
    console.log('loading', loading);
    console.log('success', success);
    console.log('failed', failed);
  }, [loading, success, failed]);

  const sendBundleAndWatch = useCallback(async () => {
    const { txHashes, maxBlockNumber, bundle, bundleHash } = await sendBundle();
    if (bundleHash) {
      simulateBundle(bundle as BundleParams['body']);
      watchBundle(txHashes[0] as `0x${string}`, maxBlockNumber);
    }
  }, [sendBundle, watchBundle, simulateBundle]);

  return (
    <AnimatePresence mode="wait">
      <div className="flex w-full flex-col items-center gap-y-10 px-3 py-20">
        <p className="text-2xl font-semibold" onClick={sendBundleAndWatch}>
          Rescue Wallet Funds
        </p>

        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <StepperIndicator activeStep={activeStep} steps={[1, 2, 3]} />
        </motion.div>

        {activeStep === 2 && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="flex gap-2 text-3xl">
              <InfoCircledIcon className="mt-0.5 h-8 w-8" />
              <span className="">
                Please send x ETH to Rescuer wallet to cover the transaction
                fees.
              </span>
            </p>

            <p className="flex items-center gap-2 text-lg font-medium">
              <IconLoader2 className="h-5 w-5 animate-spin" />
              Status: Not Receieved
            </p>
          </div>
        )}

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
              className="flex h-full w-full max-w-[600px] flex-col px-4 py-4 md:py-6"
            >
              {activeStep === 3 ? (
                <FormRescueFundsLoading
                  formRescueFundsLoadingStatus={formRescueFundsLoadingStatus}
                />
              ) : (
                getStepContent(activeStep)
              )}
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

              {activeStep === 2 ? (
                <Button
                  className="w-[100px]"
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
              ) : (
                activeStep < 2 && (
                  <Button
                    type="button"
                    className="w-[100px]"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )
              )}
            </motion.div>
          </form>
        </FormProvider>
      </div>
    </AnimatePresence>
  );
};
