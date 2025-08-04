import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';

import { BLOCKSCAN_URLS, STORAGE_KEYS } from '@/constants';
import { useFinalBundleContext } from '@/context/final-bundle-context';
import { useStageContext } from '@/context/stage-context';
import { useEffectOnce } from '@/hooks/use-effect-once';
import { ITokenMetadata } from '@/types/tokens';

import {
  FormRescueFundsLoading,
  FormRescueFundsLoadingStatus,
} from './form-rescue-funds-loading';

export const SendFinalBundle = () => {
  const { finalBundle, setFinalBundleSuccess } = useFinalBundleContext();
  const { setStage } = useStageContext();

  const [, , removeSelectedTokens] = useLocalStorage<
    Record<string, ITokenMetadata>
  >(STORAGE_KEYS.selectedTokens, {});
  const [, , removeReceiverAddress] = useLocalStorage<string | null>(
    STORAGE_KEYS.receiverAddress,
    null,
  );
  const [, , removeVictimPrivateKey] = useLocalStorage<string | null>(
    STORAGE_KEYS.victimPrivateKey,
    null,
  );
  const [, , removeVictimAddress] = useLocalStorage<string | null>(
    STORAGE_KEYS.victimAddress,
    null,
  );
  const [, , removeAuthorizationSignature] = useLocalStorage<string | null>(
    STORAGE_KEYS.authorizationSignature,
    null,
  );
  const [, , removeEip712Signature] = useLocalStorage<string | null>(
    STORAGE_KEYS.eip712Signature,
    null,
  );
  const [status, setStatus] = useState<FormRescueFundsLoadingStatus>('loading');
  const [data, setData] = useState<{ rescueTransactionHash: string } | null>(
    null,
  );

  const clearAllLocalStorage = () => {
    removeSelectedTokens();
    removeReceiverAddress();
    removeVictimPrivateKey();
    removeVictimAddress();
    removeAuthorizationSignature();
    removeEip712Signature();
  };

  const { mutate: rescueTokensResponse } = useMutation<{
    rescueTransactionHash: string;
  }>({
    mutationFn: async () => {
      const response = await axios.post(`/api/rescue`, finalBundle);

      return response.data.data;
    },
    onMutate: () => {
      setStatus('loading');
    },
    onSuccess: (response: { rescueTransactionHash: string }) => {
      setData(response);
      setFinalBundleSuccess(true);
      clearAllLocalStorage();
      setStatus('success');
    },
    onError: (err: any) => {
      if (err?.response?.data?.remainingEth) {
        toast.error(
          `Failed to rescue tokens. You need to send ${err?.response?.data?.remainingEth} ETH to the victim wallet.`,
          {
            duration: 4000,
          },
        );

        setTimeout(() => {
          setStage(2);
        }, 4000);
      } else {
        toast.error(err?.response?.data?.error || 'Failed to rescue tokens', {
          duration: 4000,
        });

        setStatus('error');
      }
    },
  });

  useEffectOnce(() => {
    if (finalBundle) {
      rescueTokensResponse();
    }
  });

  return (
    <FormRescueFundsLoading
      formRescueFundsLoadingStatus={status}
      tryAgain={rescueTokensResponse}
      balanceUrl={`${BLOCKSCAN_URLS[finalBundle?.chainId as keyof typeof BLOCKSCAN_URLS]}/${data?.rescueTransactionHash}`}
    />
  );
};
