import React from 'react';
import { useFormContext } from 'react-hook-form';

import { FloatingLabelInput } from '@/components/ui/floating-input';
import { StepperFormValues } from '@/types/hook-stepper';

export const AirdropContractInfo = () => {
  const {
    formState: { errors },
    register,
  } = useFormContext<StepperFormValues>();

  return (
    <div className="flex flex-col gap-8">
      <h4 className="text-center text-lg font-semibold">
        Airdrop Contract Information
      </h4>
      <div className="flex flex-col gap-4">
        <FloatingLabelInput
          id="airdropContractAddress"
          label="Airdrop Contract Address"
          {...register('airdropContractAddress', {
            required: 'Required',
            maxLength: {
              value: 42,
              message: 'Invalid contract address format',
            },
            pattern: {
              value: /^(0x)?[0-9a-fA-F]{40}$/,
              message: 'Invalid contract address format',
            },
          })}
          error={errors.airdropContractAddress?.message}
        />
        <FloatingLabelInput
          id="callData"
          label="Call Data"
          // TODO: cross-check regex for this
          {...register('callData', {
            required: 'Required',
            minLength: {
              value: 10,
              message: 'Invalid call data format',
            },
            pattern: {
              value: /^(0x)?[0-9a-fA-F]{10,}$/,
              message: 'Invalid call data format',
            },
          })}
          error={errors.callData?.message}
        />
      </div>
    </div>
  );
};
