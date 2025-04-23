import { InfoCircledIcon } from '@radix-ui/react-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IconLoader2 } from '@tabler/icons-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';
import { mainnet, sepolia } from 'viem/chains';
import { useAccount } from 'wagmi';

import { RpcEnforcerContext } from '@/components/rpc-enforcer-provider';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { CHAIN_ID } from '@/lib/constants';

const ConnectSenderWallet = ({
  setSenderWallet,
  setStage,
}: {
  setSenderWallet: (wallet: `0x${string}` | null) => void;
  setStage: (stage: number) => void;
}) => {
  const { address, isConnected, chainId } = useAccount();
  const [victimWallet] = useLocalStorage<`0x${string}` | null>(
    'victimWallet',
    null,
  );

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="flex justify-center gap-2">
          <span className="text-xl font-medium text-yellow-700 dark:text-yellow-400">
            Please connect a [safe] wallet to send funds.
            <br />
          </span>
        </p>
        <p className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
          <InfoCircledIcon className="-mt-0.5 size-6" />
          <span>
            This wallet can be any wallet{' '}
            <span className="font-bold">but the victim or hacked wallet</span> .
            It would be used to send ETH to the victim wallet for gas fees.
          </span>
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />

        {isConnected && address !== victimWallet && CHAIN_ID === chainId && (
          <Button
            className="w-[150px] !rounded-full bg-purple-500 text-sm hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
            onClick={() => {
              setSenderWallet(address!);
              setStage(2);
            }}
            type="button"
          >
            Confirm
          </Button>
        )}

        {isConnected && address === victimWallet && (
          <p className="w-fit text-sm text-red-500 hover:text-red-600 dark:text-red-600 dark:hover:text-red-700">
            You are connected to the victim wallet, please connect to a
            different wallet
          </p>
        )}
      </div>
    </>
  );
};

const AddCustomRPC = ({
  setStage,
  uuid,
}: {
  setStage: (stage: number) => void;
  uuid: string;
}) => {
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const { addCustomNetwork, checkIfConnectedtoFlashbotRpc } =
    useContext(RpcEnforcerContext);

  const [_, copy] = useCopyToClipboard();

  const rpcUrl = useMemo(
    () =>
      `https://rpc${process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? '-sepolia' : ''}.flashbots.net?bundle=${uuid}`,
    [uuid],
  );

  const proceed = useCallback(async () => {
    setCheckLoading(true);
    const isConnected = await checkIfConnectedtoFlashbotRpc();

    if (isConnected) {
      setStage(3);
    } else {
      toast.error('Please connect to the Flashbots Protect RPC');
    }

    setCheckLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="flex justify-center gap-2">
          <span className="text-xl font-medium text-yellow-700 dark:text-yellow-400">
            Add Flashbots Protect RPC.
            <br />
          </span>
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <Button
          className="w-[150px] !rounded-full bg-purple-500 text-sm hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
          onClick={() => addCustomNetwork(rpcUrl)}
          type="button"
        >
          Add automatically
        </Button>

        <div className="space-y-3 text-center text-white">
          <p className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
            <InfoCircledIcon className="-mt-0.5 size-6" />
            <span>
              If adding automatically does not work, please add the following
              RPC manually to your wallet:
            </span>
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-medium">RPC Name:</p>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              RescueFi-Flashbots Protect
            </span>

            <p className="text-lg font-medium">Chain ID:</p>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {process.env.NEXT_PUBLIC_NETWORK === 'sepolia'
                ? sepolia.id
                : mainnet.id}
            </span>

            <p className="text-lg font-medium">RPC URL:</p>
            <span className="flex justify-center">
              <span
                className="block w-fit cursor-pointer rounded-md bg-purple-500 bg-opacity-20 px-2 py-0.5 text-xs text-purple-500"
                onClick={() => copy(rpcUrl)}
              >
                {rpcUrl}
              </span>
            </span>
          </div>

          <Button
            className="w-fit !rounded-full bg-purple-500 text-sm hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
            onClick={proceed}
            type="button"
          >
            {checkLoading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              'I have added the RPC, Proceed'
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export const ConnectSignTransactions = () => {
  const uuid = uuidv4();

  const [stage, setStage] = useState<number>(1);
  const [_, setSenderWallet] = useLocalStorage<`0x${string}` | null>(
    'senderWallet',
    null,
  );

  const stageContent = useMemo(() => {
    switch (stage) {
      case 1:
        return (
          <ConnectSenderWallet
            setSenderWallet={setSenderWallet}
            setStage={setStage}
          />
        );
      case 2:
        return <AddCustomRPC setStage={setStage} uuid={uuid} />;
      default:
        return 'Unknown stage';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, uuid]);

  return (
    <div className="flex flex-col gap-8">
      <h4 className="text-center text-lg font-semibold">
        Connect Wallets & Sign Transactions
      </h4>
      {stageContent}
    </div>
  );
};
