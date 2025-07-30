import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';

import { BLOCKSCAN_URLS, QUERY_KEYS, STORAGE_KEYS } from '@/constants';
import { useFinalBundleContext } from '@/context/final-bundle-context';
import { useEffectOnce } from '@/hooks/use-effect-once';
import { ITokenMetadata } from '@/types/tokens';

import { FormRescueFundsLoading } from './form-rescue-funds-loading';

export const SendFinalBundle = () => {
  const { finalBundle } = useFinalBundleContext();
  const queryClient = useQueryClient();

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

  const clearAllLocalStorage = () => {
    removeSelectedTokens();
    removeReceiverAddress();
    removeVictimPrivateKey();
    removeVictimAddress();
    removeAuthorizationSignature();
    removeEip712Signature();
  };

  const {
    mutate: rescueTokensResponse,
    isPending: isRescueTokensLoading,
    isError: isRescueTokensError,
    isSuccess: isRescueTokensSuccess,
    data: rescueTokensData,
  } = useMutation<{
    rescueTransactionHash: string;
  }>({
    mutationFn: async () => {
      const response = await axios.post(`/api/rescue`, finalBundle);

      if (response.data.error || !response.data.success) {
        toast.error(response.data.error || '');
        throw new Error(response.data.error);
      }

      return response.data.data;
    },
    onSuccess: () => {
      clearAllLocalStorage();
    },
  });

  useEffectOnce(() => {
    if (finalBundle) {
      rescueTokensResponse();
    }
  });

  const status = useMemo(() => {
    if (isRescueTokensSuccess || rescueTokensData) return 'success';
    if (isRescueTokensLoading) return 'loading';
    if (isRescueTokensError) return 'error';
    return 'loading';
  }, [
    isRescueTokensLoading,
    isRescueTokensSuccess,
    isRescueTokensError,
    rescueTokensData,
  ]);

  return (
    <FormRescueFundsLoading
      formRescueFundsLoadingStatus={status}
      tryAgain={() => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.rescueTokens, finalBundle?.compromisedAddress],
        });
      }}
      balanceUrl={`${BLOCKSCAN_URLS[finalBundle?.chainId as keyof typeof BLOCKSCAN_URLS]}/${rescueTokensData?.rescueTransactionHash}`}
    />
  );
};
