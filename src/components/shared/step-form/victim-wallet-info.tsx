import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import { StepperFormValues } from '@/types/hook-stepper';

export const VictimWalletInfo = () => {
  const {
    formState: { errors },
    register,
  } = useFormContext<StepperFormValues>();

  return (
    <div className="flex flex-col gap-8">
      <h4 className="text-center text-lg font-semibold">
        Victim Wallet Information
      </h4>
      <div className="flex flex-col gap-4">
        <FloatingLabelInput
          id="victimPrivateKey"
          label="Wallet Private Key (Victim)"
          {...register('victimPrivateKey', {
            required: 'Required',
            pattern: {
              value: /^(0x)?[0-9a-fA-F]{64}$/,
              message: 'Invalid private key format',
            },
          })}
          infoText={
            <p className="text-xxs mt-1 flex items-center gap-1 opacity-70">
              <IconInfoCircle className="h-4 w-4" />
              Address: 0x0000000000000000000000000000000000000000
            </p>
          }
          error={errors.victimPrivateKey?.message}
        />
        <FloatingLabelInput
          id="tokenAddress"
          label="Token Address"
          {...register('tokenAddress', {
            required: 'Required',
            pattern: {
              value: /^(0x)?[0-9a-fA-F]{40}$/,
              message: 'Invalid token address format',
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
              value: /^\d+$/,
              message: 'Only numbers are allowed',
            },
          })}
          error={errors.amountToSalvage?.message}
          infoText={
            <p className="text-xxs mt-1 flex items-center gap-1 opacity-70">
              <IconInfoCircle className="h-4 w-4" />
              Balance: 20 SOL
            </p>
          }
          extraElement={
            <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-3">
              <p className="text-xxs text-gray-600 dark:text-gray-400">USD</p>

              <Button
                className="h-6"
                onClick={(e) => {
                  e.preventDefault();
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
