import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';

import { ERC20_INTERFACE } from '@/lib/constants';
import { getPublicClient } from '@/lib/utils';
import { Tx } from '@/types/transaction';

export const useCreateRescueWalletTxs = () => {
  const publicClient = getPublicClient();

  async function createTxs(
    victimWalletAddress: `0x${string}`,
    receiverWalletAddress: `0x${string}`,
    erc20Transfers: {
      token: `0x${string}`;
      amount: bigint;
    }[],
  ): Promise<{ funder: Tx; victim: Tx[] }> {
    const txs = erc20Transfers.map(({ token, amount }) => ({
      to: token,
      data: ERC20_INTERFACE.encodeFunctionData('transfer', [
        receiverWalletAddress,
        amount,
      ]) as `0x${string}`,
      value: BigInt(0),
    }));

    const gases = await Promise.all(
      txs.map(async ({ to, data, value }) => {
        const gas = await publicClient.estimateGas({
          account: victimWalletAddress,
          to,
          data,
          value,
        });
        return (gas * BigInt(115)) / BigInt(100);
      }),
    );

    const totalGas = gases.reduce((acc, gas) => acc + gas, BigInt(21000));
    const block = await publicClient.getBlock();
    const maxBaseFee = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
      BigInt(block.baseFeePerGas ?? 0),
      3,
    );

    const priorityFee = BigInt(3) * BigInt(1e9);
    const maxFeePerGas = maxBaseFee + priorityFee;
    const totalGasPrice = totalGas * maxFeePerGas;

    const _txs = gases.map((gas, index) => ({
      ...txs[index],
      maxFeePerGas,
      gas,
      maxPriorityFeePerGas: priorityFee,
      value: index === 0 ? totalGasPrice : BigInt(0),
    }));

    return {
      funder: {
        to: victimWalletAddress,
        value: BigInt(0),
        data: '0x' as `0x${string}`,
        maxFeePerGas,
        gas: BigInt(21000),
        maxPriorityFeePerGas: priorityFee,
      },
      victim: _txs,
    };
  }

  return { createTxs };
};
