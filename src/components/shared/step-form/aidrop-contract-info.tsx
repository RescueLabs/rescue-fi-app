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
          // TODO: Add regex for contract address
          {...register('airdropContractAddress', { required: 'Required' })}
          error={errors.airdropContractAddress?.message}
        />
        <FloatingLabelInput
          id="callData"
          label="Call Data"
          // TODO: Add regex for call data
          {...register('callData', { required: 'Required' })}
          error={errors.callData?.message}
        />
      </div>
    </div>
  );
};
