import { useCallback } from 'react';
import { useAccount } from 'wagmi';

export const useConnectedToFlashbotRpc = () => {
  const { connector, isConnected, address } = useAccount();

  const checkIfConnectedtoFlashbotRpc = useCallback(async () => {
    if (!isConnected) return false;

    const provider = await connector?.getProvider();

    try {
      const response = await (provider as any).request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      const balanceInWei = parseInt(response, 16);
      const balanceInEth = balanceInWei / 1e18;

      return balanceInEth === 100;
    } catch (error) {
      console.log(error);
      return false;
    }
  }, [connector, isConnected, address]);

  return {
    checkIfConnectedtoFlashbotRpc,
  };
};
