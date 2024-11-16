import { IconFidgetSpinner, IconInfoCircle } from '@tabler/icons-react';
import { Contract, formatUnits, JsonRpcProvider } from 'ethers';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import { RPC_URL } from '@/lib/constants';
import ERC20_ABI from '@/lib/constants/abis/erc20.json';
import { getWalletAddressFromPrivateKey } from '@/lib/utils';
import { StepperFormValues } from '@/types/hook-stepper';

export const VictimWalletInfo = () => {
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [tokenSymbolLoading, setTokenSymbolLoading] = useState<boolean>(false);

  const {
    formState: { errors },
    setError,
    register,
    setValue,
  } = useFormContext<StepperFormValues>();

  const victimPrivateKey = useWatch({
    name: 'victimPrivateKey',
  });

  const tokenAddress = useWatch({
    name: 'tokenAddress',
  });

  const provider = useMemo(() => new JsonRpcProvider(RPC_URL), []);

  const victimWalletAddress = useMemo(() => {
    if (
      (victimPrivateKey?.length || 0) < 66 ||
      (victimPrivateKey?.length || 0) > 66
    ) {
      return '';
    }

    return getWalletAddressFromPrivateKey(victimPrivateKey);
  }, [victimPrivateKey]);

  useEffect(() => {
    (async () => {
      try {
        setTokenSymbolLoading(true);

        if (
          (tokenAddress?.length || 0) < 42 ||
          (tokenAddress?.length || 0) > 42
        ) {
          setTokenSymbolLoading(false);
          return '';
        }

        const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
        setTokenSymbolLoading(false);

        if (!victimWalletAddress) return symbol;

        const decimals = await tokenContract.decimals();
        const tokenBal = await tokenContract.balanceOf(victimWalletAddress);
        const formattedBalance = Number(
          formatUnits(tokenBal, decimals),
        ).toFixed(3);
        setTokenBalance(formattedBalance || '0');

        return symbol;
      } catch (error) {
        setError('tokenAddress', {
          message: 'Invalid token address',
        });
        setTokenSymbolLoading(false);

        return '';
      }
    })();
  }, [tokenAddress, provider, setError, victimWalletAddress]);

  return (
    <div className="flex flex-col gap-8">
      <h4 className="text-center text-lg font-semibold">
        Victim Wallet Information
      </h4>
      <div className="flex flex-col gap-4">
        <FloatingLabelInput
          id="victimPrivateKey"
          label="Wallet Private Key (Victim) e.g. 0x..."
          {...register('victimPrivateKey', {
            required: 'Required',
            maxLength: {
              value: 66,
              message: 'Invalid private key format',
            },
            pattern: {
              value: /^(0x)?[0-9a-fA-F]{64}$/,
              message: 'Invalid private key format',
            },
          })}
          infoText={
            victimWalletAddress && (
              <motion.p
                className="text-xxs mt-1 flex gap-1 break-all opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <IconInfoCircle className="h-4 w-4 min-w-4" />
                Address: {victimWalletAddress}
              </motion.p>
            )
          }
          error={errors.victimPrivateKey?.message}
        />
        <FloatingLabelInput
          id="tokenAddress"
          label="Token Address e.g. 0x..."
          {...register('tokenAddress', {
            required: 'Required',
            maxLength: {
              value: 42,
              message: 'Invalid  address format',
            },
            pattern: {
              value: /^(0x)?[0-9a-fA-F]{40}$/,
              message: 'Invalid address format',
            },
          })}
          error={errors.tokenAddress?.message}
        />
        <FloatingLabelInput
          id="amountToSalvage"
          label="Amount to Salvage"
          {...register('amountToSalvage', {
            required: 'Required',
            pattern: {
              value: /^\d*\.?\d*$/,
              message: 'Only numbers and decimals are allowed',
            },
            validate: {
              greaterThanBalance: (value) => {
                if (parseInt(value, 10) === 0) {
                  return 'Salvage amount must be greater than 0';
                }
                if (!!value && +value > +tokenBalance) {
                  return 'Amount to salvage is greater than balance';
                }

                return true;
              },
            },
          })}
          error={errors.amountToSalvage?.message}
          infoText={
            tokenBalance &&
            tokenSymbol && (
              <p className="text-xxs mt-1 flex gap-1 opacity-70">
                <IconInfoCircle className="h-4 w-4" />
                Balance: {tokenBalance} {tokenSymbol}
              </p>
            )
          }
          extraElement={
            <div className="absolute right-3 top-1/2 z-[5] flex -translate-y-1/2 items-center gap-3">
              <p className="text-xxs text-gray-600 dark:text-gray-400">
                {tokenSymbolLoading ? (
                  <IconFidgetSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  tokenSymbol
                )}
              </p>

              <Button
                className="h-6"
                onClick={(e) => {
                  e.preventDefault();
                  setValue('amountToSalvage', tokenBalance);
                }}
              >
                Max
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
};
