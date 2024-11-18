'use client';

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
import { useSendWalletBundle } from '@/hooks/use-send-wallet-bundle';
import { MAX_BLOCK_NUMBER } from '@/lib/constants';
import { WALLET_STEPPER_FORM_KEYS } from '@/lib/constants/hook-stepper-constants';
import { StepperFormKeysType, StepperFormValues } from '@/types/hook-stepper';

import { AirdropContractInfo } from './aidrop-contract-info';
import {
  FormRescueFundsLoading,
  FormRescueFundsLoadingStatus,
} from './form-rescue-funds-loading';
import { RescueWalletInfo } from './rescue-wallet-info';
import { VictimWalletInfo } from './victim-wallet-info';

const getStepContent = (step: number) => {
  switch (step) {
    case 1:
      return <AirdropContractInfo />;
    case 2:
      return <VictimWalletInfo />;
    case 3:
      return <RescueWalletInfo />;
    default:
      return 'Unknown step';
  }
};

export const AirdropStepForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [erroredInputName, setErroredInputName] = useState('');
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
      setActiveStep(4);

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

  const estimateRescueTokenGas = useEstimateRescueTokenGas(
    '0xaE581DcDA061032677dd10aDe0b9F18268f02509',
  );
  const [gas, setGas] = useState<{
    gas: bigint;
    gasPrice: bigint;
    gasInWei: bigint;
  }>();

  const { sendBundle, loading, success, failed, watchBundle } =
    useSendWalletBundle({
      victimPrivateKey:
        '0x394b25d59562617eb109c683eb54f79d6a6f696e434cc27103c03850ff41d4ee',
      rescuerPrivateKey:
        '0x4e53e9edbfe7f327802a9022c4808120f081129a3fc91b76a12b1abff4e2e917',
      receiverAddress: '0xd8Ee094FeB76A51dFE00e08Fbb1206c8b4B54D8E',
      tokenAddress: '0xBd1899694F09EbcF2a1F3bB2DB74E570d894FC5d',
      amount: BigInt('1000000000000000000'),
      gasPrice: gas?.gasPrice ?? BigInt(0),
      gas: gas?.gas ?? BigInt(0),
    });

  useEffect(() => {
    const calculateGas = async () => {
      const { gas: _gas, gasPrice, gasInWei } = await estimateRescueTokenGas();
      console.log('gas', _gas, gasPrice, gasInWei);
      setGas({ gas: _gas, gasPrice, gasInWei });
    };
    calculateGas();
  }, [estimateRescueTokenGas]);

  useEffect(() => {
    console.log('loading', loading);
    console.log('success', success);
    console.log('failed', failed);
  }, [loading, success, failed]);

  const sendBundleAndWatch = useCallback(async () => {
    const [_, txHashes] = await sendBundle();
    watchBundle(txHashes[0] as `0x${string}`, MAX_BLOCK_NUMBER);
  }, [sendBundle, watchBundle]);

  return (
    <AnimatePresence mode="wait">
      <div className="flex w-full flex-col items-center gap-y-10 px-3 py-20">
        <p onClick={sendBundleAndWatch} className="text-2xl font-semibold">
          Rescue Airdrop Funds
        </p>

        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <StepperIndicator activeStep={activeStep} steps={[1, 2, 3, 4]} />
        </motion.div>

        {activeStep === 3 && (
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
              {activeStep === 4 ? (
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
              {activeStep !== 4 && (
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

              {activeStep === 3 ? (
                <Button
                  className="w-[100px]"
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
              ) : (
                activeStep < 3 && (
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
