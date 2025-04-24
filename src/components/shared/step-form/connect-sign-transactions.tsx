import { InfoCircledIcon } from '@radix-ui/react-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IconLoader2 } from '@tabler/icons-react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';
import { useAccount, useSendTransaction } from 'wagmi';

import { RpcEnforcerContext } from '@/components/rpc-enforcer-provider';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useCreateRescueWalletTxs } from '@/hooks/use-create-rescue-wallet-txs';
import { CHAIN_ID } from '@/lib/constants';
import { ITokenMetadata } from '@/types/tokens';
import { Tx, Txs } from '@/types/transaction';

const ConnectFunderWallet = ({
  setFunderWallet,
  setStage,
}: {
  setFunderWallet: (wallet: `0x${string}` | null) => void;
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
          <span className="text-lg font-medium text-yellow-700 dark:text-yellow-400 sm:text-xl">
            Please connect a [safe] wallet to send funds.
            <br />
          </span>
        </p>
        <p className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
          <InfoCircledIcon className="-mt-0.5 hidden size-6 min-w-4 sm:!block" />
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
              setFunderWallet(address!);
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
  uuid,
  setStage,
  setTransactions,
}: {
  uuid: string;
  setStage: (stage: number) => void;
  setTransactions: (transactions: Txs) => void;
}) => {
  const [_bundleId, setBundleId] = useLocalStorage<string | null>(
    `bundleId`,
    null,
  );
  // const [victimAddress] = useLocalStorage<`0x${string}` | null>(
  //   'victimAddress',
  //   null,
  // );
  const [receiverAddress] = useLocalStorage<`0x${string}` | null>(
    'receiverAddress',
    null,
  );
  const [selectedTokens] = useLocalStorage<Record<string, ITokenMetadata>>(
    'selectedTokens',
    {},
  );
  const [checkLoading, setCheckLoading] = useState<boolean>(false);

  const { addCustomNetwork, checkIfConnectedtoFlashbotRpc } =
    useContext(RpcEnforcerContext);

  const [_, copy] = useCopyToClipboard();
  const { createTxs } = useCreateRescueWalletTxs();

  const rpcUrl = useMemo(
    () =>
      `https://rpc${process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? '-sepolia' : ''}.flashbots.net?bundle=${uuid}`,
    [uuid],
  );

  const proceed = useCallback(async () => {
    setCheckLoading(true);
    const isConnected = await checkIfConnectedtoFlashbotRpc();

    if (isConnected) {
      setBundleId(uuid);

      const tokens = Object.values(selectedTokens).map((token) => ({
        token: token.address,
        amount: BigInt(token.amountBigInt),
      }));

      if (tokens.length === 0) {
        toast.error('No tokens selected to rescue');
        setCheckLoading(false);
        return;
      }

      try {
        const txs = await createTxs(receiverAddress!, tokens);
        setTransactions(txs);
        setStage(3);
      } catch (error) {
        toast.error('Error creating transactions');
        console.error(error);
      } finally {
        setCheckLoading(false);
      }
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
          <span className="text-lg font-medium text-yellow-700 dark:text-yellow-400 sm:text-xl">
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
            <InfoCircledIcon className="-mt-0.5 hidden size-6 min-w-4 sm:!block" />
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
              {CHAIN_ID}
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
            className="w-[226px] !rounded-full bg-purple-500 text-sm hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
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

const SignFunderTransaction = ({
  setStage,
  transaction,
}: {
  transaction: Tx;
  setStage: (stage: number) => void;
}) => {
  const { sendTransactionAsync } = useSendTransaction({
    mutation: {
      onSuccess: () => {
        toast.success('Transaction sent successfully');
        setStage(4);
      },
      onError: () => {
        toast.error('Transaction failed');
      },
    },
  });

  console.log(transaction, 'transaction');

  useEffect(() => {
    sendTransactionAsync(transaction);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="flex justify-center gap-2">
          <span className="text-lg font-medium text-yellow-700 dark:text-yellow-400 sm:text-xl">
            Please sign the funder transaction.
            <br />
          </span>
        </p>
        <p className="flex justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <InfoCircledIcon className="-mt-0.5 hidden size-6 min-w-4 sm:-mr-6 sm:!block" />
          <span>
            Great! You have added the Flashbots Protect RPC. Now you need to
            sign the transaction to send ETH to the victim wallet.
          </span>
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-4">
        <div className="relative size-32 p-4">
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/10" />
          <svg
            className="relative size-full animate-pulse text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export const ConnectSignTransactions = () => {
  const uuid = uuidv4();

  const [stage, setStage] = useState<number>(1);
  const [transactions, setTransactions] = useState<Txs | null>(null);
  const [_, setFunderWallet] = useLocalStorage<`0x${string}` | null>(
    'funderWallet',
    null,
  );

  const stageContent = useMemo(() => {
    switch (stage) {
      case 1:
        return (
          <ConnectFunderWallet
            setFunderWallet={setFunderWallet}
            setStage={setStage}
          />
        );
      case 2:
        return (
          <AddCustomRPC
            uuid={uuid}
            setStage={setStage}
            setTransactions={setTransactions}
          />
        );
      case 3:
        return (
          <SignFunderTransaction
            setStage={setStage}
            transaction={transactions?.funder!}
          />
        );
      default:
        return 'Unknown stage';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, uuid]);

  return (
    <div className="flex flex-col gap-8">
      <h4 className="text-center text-xl font-semibold sm:text-2xl">
        Connect Wallets & Sign Transactions
      </h4>
      {stageContent}
    </div>
  );
};
