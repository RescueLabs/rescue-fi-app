import {
  IconFidgetSpinner,
  IconInfoCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useLocalStorage } from 'usehooks-ts';
import { isAddress } from 'viem';

import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from '@/components/ui/select';
import { CHAINS, STORAGE_KEYS } from '@/constants';
import { useDetectTokens } from '@/hooks/use-detect-tokens';
import { useTokenDetails } from '@/hooks/use-token-details';
import {
  cn,
  getPrivateKeyAccount,
  getWalletAddressFromPrivateKey,
  isValidPrivateKey,
} from '@/lib/utils';
import { StepperFormValues } from '@/types/hook-stepper';
import { ITokenMetadata } from '@/types/tokens';

export const WalletsInfo: FC<{ formType?: 'wallet' | 'airdrop' }> = ({
  formType,
}) => {
  const [selectedChainId, setSelectedChainId] = useLocalStorage<number>(
    STORAGE_KEYS.selectedChainId,
    CHAINS[0].id,
  );

  const { getDetectedTokens } = useDetectTokens();
  const { getTokenDetails } = useTokenDetails();

  const [selectedTokens, setSelectedTokens] = useLocalStorage<
    Record<string, ITokenMetadata>
  >(STORAGE_KEYS.selectedTokens, {});
  const [victimKey] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.victimPrivateKey,
    null,
  );
  const [receiverAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.receiverAddress,
    null,
  );

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
    victimPrivateKey,
    showInputManual,
    manualTokenDetails,
    manualTokenAddress,
  ] = useWatch({
    name: [
      'victimPrivateKey',
      'showInputManual',
      'manualTokenDetails',
      'manualTokenAddress',
    ],
  });

  const toggleSelectToken = (token: ITokenMetadata) => {
    setSelectedTokens((prev) => {
      const newSelectedTokens = { ...prev };

      if (newSelectedTokens[token.info]) {
        delete newSelectedTokens[token.info];
      } else {
        newSelectedTokens[token.info] = token;
      }

      return newSelectedTokens;
    });
  };

  const addManualToken = useCallback(() => {
    const tokenIsAlreadyAdded = detectedTokens.some(
      (token) => token.info === manualTokenDetails.info,
    );

    if (tokenIsAlreadyAdded) {
      setError('manualTokenAddress', {
        message: 'Token already added',
      });
      return;
    }

    if (manualTokenDetails.amount === '0') {
      setError('manualTokenAddress', {
        message: 'Token balance is 0',
      });
      return;
    }

    setDetectedTokens((prev) => [...prev, manualTokenDetails]);
    setValue('manualTokenDetails', null);
    setValue('manualTokenAddress', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedTokens, manualTokenDetails]);

  const fetchDetectedTokens = useCallback(async () => {
    setSelectedTokens({});
    setValue('showInputManual', false);

    if (!isValidPrivateKey(victimPrivateKey)) {
      setDetectedTokens([]);
      return;
    }

    setDetectedTokensLoading(true);

    const tokens = await getDetectedTokens(
      getWalletAddressFromPrivateKey(victimPrivateKey), // victim wallet address
      selectedChainId,
      true,
    );

    setDetectedTokens(tokens || []);
    setDetectedTokensLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [victimPrivateKey, selectedChainId]);

  useEffect(() => {
    fetchDetectedTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [victimPrivateKey, selectedChainId]);

  useEffect(() => {
    (async () => {
      setValue('manualTokenDetails', null);

      if (
        !isValidPrivateKey(victimPrivateKey) ||
        !isAddress(manualTokenAddress) ||
        !showInputManual
      ) {
        return;
      }

      setManualTokenDetailsLoading(true);

      const tokenDetails = await getTokenDetails(
        manualTokenAddress,
        getWalletAddressFromPrivateKey(victimPrivateKey),
        selectedChainId,
        {
          onError: () => {
            setError('manualTokenAddress', {
              message: 'Invalid token address',
            });
          },
        },
      );

      setValue('manualTokenDetails', tokenDetails);
      setManualTokenDetailsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualTokenAddress, showInputManual, selectedChainId]);

  useEffect(() => {
    if (victimKey && receiverAddress) {
      setValue('victimPrivateKey', victimKey);
      setValue('receiverWalletAddress', receiverAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [victimKey, receiverAddress]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h4 className="text-center text-lg font-semibold">
          Wallets & Assets Information
        </h4>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Please enter the Private Key of the victim (hacked wallet) and the
          receiver wallet address.
        </p>
      </div>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-start gap-x-2">
          <div className="flex-1">
            <FloatingLabelInput
              containerClassName="w-full"
              id="victimPrivateKey"
              label="Victim Wallet Private Key e.g. 0x..."
              {...register('victimPrivateKey', {
                required: 'Required',
                validate: (value) => {
                  if (!isValidPrivateKey(value)) {
                    return 'Invalid private key format';
                  }
                  return true;
                },
              })}
              error={errors.victimPrivateKey?.message}
              infoElement={
                <>
                  {isValidPrivateKey(victimPrivateKey) && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Wallet Address:
                      {getPrivateKeyAccount(victimPrivateKey)?.address ||
                        'Invalid private key'}
                    </p>
                  )}

                  {detectedTokensLoading && detectedTokens.length === 0 ? (
                    <IconFidgetSpinner className="mt-2 size-4 animate-spin" />
                  ) : (
                    isValidPrivateKey(victimPrivateKey) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-2"
                      >
                        <p className="mb-2 text-sm">Select tokens to rescue</p>

                        {detectedTokens.length > 0 ? (
                          <div className="group rounded-lg border border-gray-200 dark:border-gray-800">
                            <div className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2">
                              <span className="text-sm font-medium">
                                {detectedTokens.length} Detected Tokens
                              </span>

                              <IconRefresh
                                className={cn(
                                  'size-4',
                                  detectedTokensLoading && 'animate-spin',
                                )}
                                onClick={fetchDetectedTokens}
                              />
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
                                        type="checkbox"
                                        id={`token-${index}`}
                                        value={token.info}
                                        className="size-3 accent-purple-600 dark:accent-purple-400"
                                        name="selectedToken"
                                        checked={token.info in selectedTokens}
                                        onChange={(_) => {
                                          toggleSelectToken(token);
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
                        )}

                        <div className="my-2 flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Input
                              type="checkbox"
                              id="useManual"
                              className="size-3 accent-purple-600 dark:accent-purple-400"
                              {...register('showInputManual')}
                            />
                            <label
                              htmlFor="useManual"
                              className="text-sm text-gray-600 dark:text-gray-400"
                            >
                              Enter token address manually
                            </label>
                          </div>
                        </div>

                        {showInputManual && (
                          <FloatingLabelInput
                            id="tokenAddress"
                            label="Token Address e.g. 0x..."
                            {...register('manualTokenAddress', {
                              validate: (value) => {
                                if (!isAddress(value)) {
                                  return 'Invalid address format';
                                }
                                return true;
                              },
                            })}
                            error={errors.manualTokenAddress?.message}
                            infoElement={
                              manualTokenDetailsLoading ? (
                                <IconFidgetSpinner className="mt-2 size-4 animate-spin" />
                              ) : (
                                !!manualTokenDetails && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                  >
                                    <p className="text-xxs mt-1 flex gap-1 opacity-70">
                                      <IconInfoCircle className="h-4 w-4" />
                                      Balance: {manualTokenDetails.amount}{' '}
                                      {manualTokenDetails.symbol}
                                    </p>

                                    <div className="mt-2 flex w-full justify-end">
                                      <Button
                                        variant="outline"
                                        type="button"
                                        onClick={addManualToken}
                                      >
                                        Add Token
                                      </Button>
                                    </div>
                                  </motion.div>
                                )
                              )
                            }
                          />
                        )}
                      </motion.div>
                    )
                  )}
                </>
              }
            />
          </div>

          <HoverCard>
            <HoverCardTrigger asChild>
              <IconInfoCircle className="mt-[10px] size-5 cursor-pointer" />
            </HoverCardTrigger>
            <HoverCardContent className="w-full max-w-80">
              <p className="text-sm">
                Why do we need the victim&apos;s private key? Click{' '}
                <Link
                  href="/faqs"
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer text-purple-500 underline"
                >
                  here
                </Link>{' '}
                to learn more.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>

        <FloatingLabelInput
          id="receiverWalletAddress"
          label="Receiver Wallet Address e.g. 0x..."
          {...register('receiverWalletAddress', {
            required: 'Required',
            validate: (value) => {
              if (!isAddress(value)) {
                return 'Invalid address format';
              }
              return true;
            },
          })}
          error={errors.receiverWalletAddress?.message}
        />

        <Select
          value={selectedChainId.toString()}
          onValueChange={(value: string) => setSelectedChainId(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Chain" />
          </SelectTrigger>
          <SelectContent>
            {CHAINS.map((chain) => (
              <SelectItem key={chain.id} value={chain.id.toString()}>
                {chain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
