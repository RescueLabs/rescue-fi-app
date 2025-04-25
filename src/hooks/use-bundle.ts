import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useBundle = () => {
  const {
    mutateAsync: sendBundle,
    status,
    error,
  } = useMutation({
    mutationFn: async (bundleId: string) => {
      const bundle = await axios.post(
        `/api/send-bundle`,
        {
          bundleId,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      return bundle.data;
    },
  });

  return { sendBundle, bundleStatus: status, bundleError: error };
};
