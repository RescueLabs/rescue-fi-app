'use client';

import { BundleParams } from '@flashbots/mev-share-client';
import { CheckCircledIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { IconLoader2 } from '@tabler/icons-react';
import { parseUnits } from 'ethers';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { StepperIndicator } from '@/components/shared/stepper-indicator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useClaimAirdropBundle } from '@/hooks/use-claim-airdrop-bundle';
import { useEstimateClaimAirdropGas } from '@/hooks/use-estimate-claim-airdrop-gas';
import { useEstimateRescueTokenGas } from '@/hooks/use-estimate-rescue-token-gas';
import { useEthBalance } from '@/hooks/use-eth-balance';
import { useSimulateBundle } from '@/hooks/use-simulate-bundle';
import { useTokenDetails } from '@/hooks/use-token-details';
import { roundToFiveDecimals, validateTokenAddress } from '@/lib/utils';
import { StepperFormValues } from '@/types/hook-stepper';

import { AirdropContractInfo } from './aidrop-contract-info';
import { FormRescueFundsLoading } from './form-rescue-funds-loading';
import { RescueWalletInfo } from './rescue-wallet-info';
import { VictimWalletInfo } from './victim-wallet-info';

const getStepContent = (step: number) => {
  switch (step) {
    case 1:
      return <AirdropContractInfo />;
    case 2:
      return <VictimWalletInfo formType="airdrop" />;
    case 3:
      return <RescueWalletInfo />;
    default:
      return 'Unknown step';
  }
};

export const AirdropStepForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [erroredInputName, setErroredInputName] = useState('');
  const [errorSubmitting, setErrorSubmitting] = useState<boolean>(false);
  const methods = useForm<StepperFormValues>({
    mode: 'onChange',
  });

  const [tokenAddress, airdropContractAddress, callData, rescuerPrivateKey] =
    useWatch({
      control: methods.control,
      name: [
        'tokenAddress',
        'airdropContractAddress',
        'callData',
        'rescuerPrivateKey',
      ],
    });

  const [calculatedGas, setCalculatedGas] = useState<{
    gas: bigint;
    txGases: bigint[];
    gasPrice: bigint;
    gasInWei: bigint;
  }>();

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const estimateRescueTokenGas = useEstimateRescueTokenGas(tokenAddress);
  const estimateClaimAirdropGas = useEstimateClaimAirdropGas();
  const { getTokenDetails } = useTokenDetails();

  const {
    ethBalanceEnough,
    ethRemainingBalance,
    isFetchingEthRemainingBalance,
  } = useEthBalance({
    rescuerPrivateKey,
    balanceNeeded: calculatedGas?.gasInWei,
  });

  const handleNext = useCallback(() => {
    if (
      (isValid && activeStep !== 3) ||
      (isValid && activeStep === 3 && ethBalanceEnough)
    )
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [isValid, activeStep, ethBalanceEnough]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const calculateGas = useCallback(async (): Promise<{
    gas: bigint;
    txGases: bigint[];
    gasPrice: bigint;
    gasInWei: bigint;
  }> => {
    const {
      gas: sendTokenGas,
      gasPrice,
      gasInWei,
    } = await estimateRescueTokenGas();
    const { gas: claimAirdropGas } = await estimateClaimAirdropGas({
      airdropContractAddress,
      methodId: callData.slice(0, 10),
    });

    return {
      gas: sendTokenGas + claimAirdropGas + BigInt(21000),
      txGases: [BigInt(21000), claimAirdropGas, sendTokenGas],
      gasPrice,
      gasInWei: BigInt(21000) * gasPrice + gasInWei,
    };
  }, [
    estimateRescueTokenGas,
    estimateClaimAirdropGas,
    airdropContractAddress,
    callData,
  ]);

  const { sendBundle, watchBundle, success, failed, loading } =
    useClaimAirdropBundle();
  const { simulateBundle } = useSimulateBundle();

  const onSubmit = async (formData: StepperFormValues) => {
    try {
      if (!ethBalanceEnough) return;

      setActiveStep(4);

      const calcGas = await calculateGas();

      const { decimals } = await getTokenDetails(tokenAddress);

      const { bundleHash, txHashes, bundle, maxBlockNumber } = await sendBundle(
        {
          victimPrivateKey: formData.victimPrivateKey,
          rescuerPrivateKey,
          receiverAddress: formData.receiverWalletAddress,
          tokenAddress,
          airdropContractAddress: formData.airdropContractAddress,
          data: formData.callData,
          txGases: calcGas?.txGases ?? [BigInt(21000), BigInt(0), BigInt(0)],
          amount: BigInt(parseUnits(formData.amountToSalvage, decimals)),
          gasPrice: calcGas?.gasPrice ?? BigInt(0),
          gas: calcGas?.gas ?? BigInt(0),
        },
      );

      if (bundleHash) {
        simulateBundle(bundle as BundleParams['body']);
        watchBundle(txHashes[0] as `0x${string}`, maxBlockNumber);
      }
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
      activeStep === 3 &&
      calculateGas &&
      validateTokenAddress(tokenAddress) &&
      validateTokenAddress(airdropContractAddress) &&
      callData
    ) {
      calculateGas().then(setCalculatedGas);
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
          Rescue Airdrop Funds
        </motion.p>

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
              {ethBalanceEnough ? (
                <CheckCircledIcon className="mt-0.5 h-8 w-8 text-green-500" />
              ) : (
                <InfoCircledIcon className="mt-0.5 h-8 w-8" />
              )}
              <span className="">
                {ethBalanceEnough
                  ? 'All set!'
                  : `Please send ${roundToFiveDecimals(
                      Number(ethRemainingBalance) / 10 ** 18,
                    )} ETH to Rescuer wallet to cover the transaction fees.`}
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
              {activeStep === 4 ? (
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
