import { IconFidgetSpinner, IconInfoCircle } from '@tabler/icons-react';
import React, { FC, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { isAddress } from 'viem';

import { FloatingLabelInput } from '@/components/ui/floating-input';
import { Input } from '@/components/ui/input';
import { useDetectTokens } from '@/hooks/use-detect-tokens';
import { useTokenDetails } from '@/hooks/use-token-details';
import { StepperFormValues } from '@/types/hook-stepper';
import { ITokenMetadata } from '@/types/tokens';

export const WalletsInfo: FC<{ formType?: 'wallet' | 'airdrop' }> = ({
  formType,
}) => {
  const { getDetectedTokens } = useDetectTokens();
  const { getTokenDetails } = useTokenDetails();

  const [detectedTokens, setDetectedTokens] = useState<ITokenMetadata[]>([]);
  const [detectedTokensLoading, setDetectedTokensLoading] =
    useState<boolean>(false);
  const [manualTokenDetailsLoading, setManualTokenDetailsLoading] =
    useState<boolean>(false);

  const {
    formState: { errors },
    setError,
    setValue,
    register,
  } = useFormContext<StepperFormValues>();

  const [
    victimWalletAddress,
    receiverWalletAddress,
    tokenSource,
    selectedToken,
    manualTokenAddress,
  ] = useWatch({
    name: [
      'victimWalletAddress',
      'receiverWalletAddress',
      'tokenSource',
      'selectedToken',
      'manualTokenAddress',
    ],
  });

  useEffect(() => {
    (async () => {
      if (
        !isAddress(victimWalletAddress) ||
        !isAddress(receiverWalletAddress)
      ) {
        setDetectedTokens([]);
        return;
      }

      setDetectedTokensLoading(true);

      const tokens = await getDetectedTokens(
        victimWalletAddress,
        receiverWalletAddress,
        true,
      );

      setDetectedTokens(tokens || []);
      setDetectedTokensLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [victimWalletAddress, receiverWalletAddress]);

  useEffect(() => {
    (async () => {
      setValue('selectedToken', null);

      if (
        !isAddress(victimWalletAddress) ||
        !isAddress(receiverWalletAddress) ||
        !isAddress(manualTokenAddress) ||
        tokenSource !== 'manual'
      ) {
        setValue('selectedToken', null);
        return;
      }

      setManualTokenDetailsLoading(true);

      const tokenDetails = await getTokenDetails(
        manualTokenAddress,
        victimWalletAddress,
        receiverWalletAddress,
        {
          onError: () => {
            setError('manualTokenAddress', {
              message: 'Invalid token address',
            });
          },
        },
      );

      setValue('selectedToken', tokenDetails);
      setManualTokenDetailsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualTokenAddress, tokenSource]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h4 className="text-center text-lg font-semibold">
          Wallets Information
        </h4>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Please enter the Wallets of the victim (hacked wallet) and the
          receiver wallet address.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <FloatingLabelInput
          id="victimWalletAddress"
          label="Victim Wallet Address e.g. 0x..."
          {...register('victimWalletAddress', {
            required: 'Required',
            maxLength: {
              value: 42,
              message: 'Invalid address format',
            },
            pattern: {
              value: /^(0x)?[0-9a-fA-F]{40}$/,
              message: 'Invalid address format',
            },
          })}
          error={errors.victimWalletAddress?.message}
          infoText={
            detectedTokensLoading ? (
              <IconFidgetSpinner className="mt-2 size-4 animate-spin" />
            ) : (
              isAddress(victimWalletAddress) &&
              isAddress(receiverWalletAddress) && (
                <div className="mt-2">
                  <p className="mb-2 text-sm">Select token to rescue</p>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Input
                        type="radio"
                        id="useDetected"
                        value="detected"
                        className="h-4 w-4 accent-purple-600 dark:accent-purple-400"
                        defaultChecked
                        {...register('tokenSource')}
                      />
                      <label
                        htmlFor="useDetected"
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        Use detected tokens
                      </label>
                    </div>

                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Input
                        type="radio"
                        id="useManual"
                        value="manual"
                        className="h-4 w-4 accent-purple-600 dark:accent-purple-400"
                        {...register('tokenSource')}
                      />
                      <label
                        htmlFor="useManual"
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        Enter token address manually
                      </label>
                    </div>
                  </div>

                  {tokenSource === 'manual' && (
                    <FloatingLabelInput
                      id="tokenAddress"
                      label="Token Address e.g. 0x..."
                      {...register('manualTokenAddress', {
                        required: 'Required',
                        maxLength: {
                          value: 42,
                          message: 'Invalid address format',
                        },
                        pattern: {
                          value: /^(0x)?[0-9a-fA-F]{40}$/,
                          message: 'Invalid address format',
                        },
                      })}
                      error={errors.manualTokenAddress?.message}
                      infoText={
                        manualTokenDetailsLoading ? (
                          <IconFidgetSpinner className="mt-2 size-4 animate-spin" />
                        ) : (
                          tokenSource === 'manual' &&
                          !!selectedToken && (
                            <p className="text-xxs mt-1 flex gap-1 opacity-70">
                              <IconInfoCircle className="h-4 w-4" />
                              Balance: {selectedToken.amount}{' '}
                              {selectedToken.symbol}
                            </p>
                          )
                        )
                      }
                    />
                  )}

                  {tokenSource === 'detected' &&
                    (detectedTokens.length > 0 ? (
                      <div className="group rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2">
                          <span className="text-sm font-medium">
                            {detectedTokens.length} Detected Tokens
                          </span>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-800">
                          <ul className="max-h-[200px] space-y-2 overflow-y-auto">
                            {detectedTokens.map((token, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="radio"
                                    id={`token-${index}`}
                                    value={token.info}
                                    className="size-3 accent-purple-600 dark:accent-purple-400"
                                    name="selectedToken"
                                    checked={selectedToken?.info === token.info}
                                    onChange={(_) => {
                                      setValue('selectedToken', token);
                                    }}
                                  />
                                  <label
                                    htmlFor={`token-${index}`}
                                    className="flex items-center gap-2 font-medium"
                                  >
                                    <IconInfoCircle className="size-4" />
                                    {token.symbol}
                                  </label>
                                </div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {token.amount} {token.symbol}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No tokens detected
                      </p>
                    ))}
                </div>
              )
            )
          }
        />
        <FloatingLabelInput
          id="receiverWalletAddress"
          label="Receiver Wallet Address e.g. 0x..."
          {...register('receiverWalletAddress', {
            required: 'Required',
            maxLength: {
              value: 42,
              message: 'Invalid address format',
            },
            pattern: {
              value: /^(0x)?[0-9a-fA-F]{40}$/,
              message: 'Invalid address format',
            },
          })}
          error={errors.receiverWalletAddress?.message}
        />
      </div>
    </div>
  );
};
