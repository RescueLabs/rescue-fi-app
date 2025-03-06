'use client';

import { BundleParams } from '@flashbots/mev-share-client';
import { CheckCircledIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { IconLoader2 } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { StepperIndicator } from '@/components/shared/stepper-indicator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEthBalance } from '@/hooks/use-eth-balance';
import { useGasPrice } from '@/hooks/use-gas-Price';
import { useRescueTokenBundle } from '@/hooks/use-rescue-token-bundle';
import { useSimulateBundle } from '@/hooks/use-simulate-bundle';
import { useTokenDetails } from '@/hooks/use-token-details';
import { ERC20_INTERFACE, NETWORK } from '@/lib/constants';
import {
  getPrivateKeyAccount,
  getPublicClient,
  roundToFiveDecimals,
  validatePrivateKey,
  validateTokenAddress,
} from '@/lib/utils';
import { GasDetails } from '@/types/gas';
import { StepperFormValues } from '@/types/hook-stepper';

import { FormRescueFundsLoading } from './form-rescue-funds-loading';
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
  const [errorSubmitting, setErrorSubmitting] = useState<boolean>(false);
  const [erroredInputName, setErroredInputName] = useState<string>('');

  const methods = useForm<StepperFormValues>({
    mode: 'onChange',
  });

  const [
    tokenAddress,
    rescuerPrivateKey,
    receiverWalletAddress,
    victimPrivateKey,
  ] = useWatch({
    control: methods.control,
    name: [
      'tokenAddress',
      'rescuerPrivateKey',
      'receiverWalletAddress',
      'victimPrivateKey',
    ],
  });
  const [gasDetails, setGasDetails] = useState<GasDetails>();

  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice();
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const { getTokenDetails } = useTokenDetails();

  const {
    ethBalanceEnough,
    ethRemainingBalance,
    isFetchingEthRemainingBalance,
  } = useEthBalance({
    rescuerPrivateKey,
    balanceNeeded: gasDetails?.gasInWei,
    options: {
      enabled: activeStep === 2,
    },
  });

  const handleNext = useCallback(() => {
    console.log('handleNext', isValid, activeStep, ethBalanceEnough);
    if (
      (isValid && activeStep !== 2) ||
      (isValid && activeStep === 2 && ethBalanceEnough)
    )
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [isValid, activeStep, ethBalanceEnough]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const { sendBundle, loading, success, failed, watchBundle } =
    useRescueTokenBundle();
  const { simulateBundle } = useSimulateBundle();

  const sendBundleAndWatch = useCallback(
    async ({
      receiverAddress,
      amount,
    }: {
      victimPrivateKey: `0x${string}`;
      receiverAddress: `0x${string}`;
      amount: bigint;
    }) => {
      const { txHashes, bundle, bundleHash, maxBlockNumber } = await sendBundle(
        {
          victimPrivateKey,
          rescuerPrivateKey,
          receiverAddress,
          tokenAddress,
          amount,
          maxFeePerGas: gasDetails?.maxFeePerGas ?? BigInt(0),
          maxPriorityFeePerGas: gasDetails?.maxPriorityFeePerGas ?? BigInt(0),
          gas: gasDetails?.totalGas ?? BigInt(0),
        },
      );

      if (bundleHash) {
        await simulateBundle(bundle as BundleParams['body']);
        watchBundle(txHashes[0] as `0x${string}`, maxBlockNumber);
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      rescuerPrivateKey,
      tokenAddress,
      gasDetails?.maxFeePerGas,
      gasDetails?.maxPriorityFeePerGas,
      gasDetails?.totalGas,
    ],
  );

  const calculateGas = useCallback(async () => {
    const publicClient = getPublicClient();
    const sendTokenGas = await publicClient.estimateGas({
      account: getPrivateKeyAccount(victimPrivateKey)?.address,
      to: tokenAddress,
      data: ERC20_INTERFACE.encodeFunctionData('transfer', [
        receiverWalletAddress,
        1,
      ]) as `0x${string}`,
    });

    const totalGas = sendTokenGas + BigInt(21000); // send ether gas + gas for sending claimed token to receiver

    setGasDetails({
      totalGas,
      txGases: [BigInt(21000), sendTokenGas],
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasInWei: totalGas * maxFeePerGas,
    });
  }, [
    maxFeePerGas,
    maxPriorityFeePerGas,
    tokenAddress,
    receiverWalletAddress,
    victimPrivateKey,
  ]);

  const onSubmit = async (formData: StepperFormValues) => {
    try {
      if (!ethBalanceEnough) return;

      setActiveStep(3);

      const { decimals } = await getTokenDetails(tokenAddress);

      sendBundleAndWatch({
        victimPrivateKey: formData.victimPrivateKey,
        receiverAddress: formData.receiverWalletAddress,
        amount: BigInt(
          Number(formData.amountToSalvage) * 10 ** Number(decimals),
        ),
      });
    } catch (error: any) {
      setErrorSubmitting(true);
      console.log(error);
    }
  };

  // focus errored input on submit
  useEffect(() => {
    const erroredInputElement =
      document.getElementsByName(erroredInputName)?.[0];
    if (erroredInputElement instanceof HTMLInputElement) {
      erroredInputElement.focus();
      setErroredInputName('');
    }
  }, [erroredInputName]);

  useEffect(() => {
    if (
      activeStep === 2 &&
      calculateGas &&
      validateTokenAddress(tokenAddress)
    ) {
      calculateGas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  return (
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

        {activeStep === 2 && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="flex gap-2 text-3xl">
              {ethBalanceEnough ? (
                <CheckCircledIcon className="mt-0.5 h-8 w-8 text-green-500" />
              ) : (
                <InfoCircledIcon className="mt-0.5 h-8 w-8" />
              )}
              <span className="">
                {ethBalanceEnough
                  ? 'All set!'
                  : `Please send ${
                      !isNaN(Number(ethRemainingBalance)) &&
                      validatePrivateKey(rescuerPrivateKey)
                        ? roundToFiveDecimals(
                            Number(ethRemainingBalance) / 10 ** 18,
                          )
                        : 'x'
                    } ETH to Rescuer wallet to cover the transaction fees.`}
              </span>
            </p>

            <p className="flex items-center gap-2 text-lg font-medium">
              <span className="flex size-5 min-w-5 items-center justify-center">
                {isFetchingEthRemainingBalance && (
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                )}
              </span>
              Status: {ethBalanceEnough ? 'ETH sufficient' : 'ETH not received'}
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
                  formRescueFundsLoadingStatus={
                    success
                      ? 'success'
                      : failed || errorSubmitting
                        ? 'error'
                        : loading
                          ? 'loading'
                          : 'loading'
                  }
                  tryAgain={() => {
                    setErrorSubmitting(false);
                    handleSubmit(onSubmit)();
                  }}
                  balanceUrl={`https://${NETWORK === 'sepolia' ? 'sepolia.' : ''}etherscan.io/token/${tokenAddress}?a=${receiverWalletAddress}`}
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
