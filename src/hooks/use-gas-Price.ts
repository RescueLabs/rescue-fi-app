import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type GasFeeData = {
  result: {
    LastBlock: string;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    suggestBaseFee: string;
    gasUsedRatio: string;
  };
};

export const useGasPrice = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gas-fee-data'],
    queryFn: async (): Promise<GasFeeData> => {
      try {
        const response = await axios.get(
          `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken`,
        );
        return response.data;
      } catch (error) {
        console.log('GasPriceError', error);
        return {
          result: {
            FastGasPrice: '0',
            LastBlock: '0',
            SafeGasPrice: '0',
            ProposeGasPrice: '0',
            suggestBaseFee: '0',
            gasUsedRatio: '0',
          },
        };
      }
    },
  });

  let gasPrice = BigInt(
    Math.round(parseFloat(data?.result.FastGasPrice || '0') * 1_000_000_000),
  );
  gasPrice *= BigInt(110) / BigInt(100);

  return { gasPrice, isLoading, isError };
};
