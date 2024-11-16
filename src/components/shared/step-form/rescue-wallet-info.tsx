import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { IconInfoCircle } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { FloatingLabelInput } from '@/components/ui/floating-input';
import { getWalletAddressFromPrivateKey } from '@/lib/utils';
import { StepperFormValues } from '@/types/hook-stepper';

export const RescueWalletInfo = () => {
  const {
    formState: { errors },
    register,
  } = useFormContext<StepperFormValues>();

  const rescuerPrivateKey = useWatch({
    name: 'rescuerPrivateKey',
  });

  const rescuerWalletAddress = useMemo(() => {
    if (
      (rescuerPrivateKey?.length || 0) < 66 ||
      (rescuerPrivateKey?.length || 0) > 66
    ) {
      return '';
    }

    return getWalletAddressFromPrivateKey(rescuerPrivateKey);
  }, [rescuerPrivateKey]);

  return (
    <div className="flex flex-col gap-8">
      <h4 className="text-center text-lg font-semibold">
        Rescuer Wallet Information
      </h4>
      <div className="flex flex-col gap-1">
        <p className="flex gap-2">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-yellow-700 dark:text-yellow-400" />
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            Please ensure the Rescuer wallet is a fresh wallet to reduce
            potential loss of funds.Visit this link for more info.
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <FloatingLabelInput
          id="rescuerPrivateKey"
          label="Wallet Private Key (Rescuer)"
          {...register('rescuerPrivateKey', {
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
            rescuerWalletAddress && (
              <p className="text-xxs mt-1 flex gap-1 break-all opacity-70">
                <IconInfoCircle className="h-4 w-4 min-w-4" />
                Address: {rescuerWalletAddress}
              </p>
            )
          }
          error={errors.rescuerPrivateKey?.message}
        />
      </div>
    </div>
  );
};
