import React, { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import { useBundle } from '@/hooks/use-bundle';
import { NETWORK, STORAGE_KEYS } from '@/lib/constants';
import { ITokenMetadata } from '@/types/tokens';

import { FormRescueFundsLoading } from './form-rescue-funds-loading';

export const SendFinalBundle = () => {
  const { sendBundle } = useBundle();

  const [bundleId] = useLocalStorage<string | null>(
    STORAGE_KEYS.bundleId,
    null,
  );
  const [selectedTokens] = useLocalStorage<Record<string, ITokenMetadata>>(
    STORAGE_KEYS.selectedTokens,
    {},
  );
  const [receiverAddress] = useLocalStorage<string | null>(
    STORAGE_KEYS.receiverAddress,
    null,
  );
  const [success, setSuccess] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [errorSubmitting, setErrorSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    const bundleData = await sendBundle(bundleId!);
    if (bundleData?.success) {
      setSuccess(true);
    } else {
      setFailed(true);
    }
    setLoading(false);
  }, [bundleId, sendBundle]);

  useEffect(() => {
    handleSubmit();
  }, [handleSubmit]);

  return (
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
        handleSubmit();
      }}
      balanceUrl={`https://${NETWORK === 'sepolia' ? 'sepolia.' : ''}etherscan.io/token/${Object.values(selectedTokens)[0].address}?a=${receiverAddress}`}
    />
  );
};
