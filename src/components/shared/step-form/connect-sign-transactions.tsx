import { InfoCircledIcon } from '@radix-ui/react-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IconLoader2 } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import React, {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';
import { useAccount, useSendTransaction } from 'wagmi';

import { RpcEnforcerContext } from '@/components/rpc-enforcer-provider';
import { LoadingSigning } from '@/components/shared/icons/loading-signing';
import { Button } from '@/components/ui/button';
import { useStageContext } from '@/context/stage-context';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useCreateRescueWalletTxs } from '@/hooks/use-create-rescue-wallet-txs';
import { useEffectOnce } from '@/hooks/use-effect-once';
import { CHAIN_ID, STORAGE_KEYS } from '@/lib/constants';
import { ITokenMetadata } from '@/types/tokens';
import { Tx, Txs } from '@/types/transaction';

const ConnectWallet = ({
  titleMessage,
  goToNextStage,
  isValidAddress,
  descriptionMessage,
  validAddressMessage,
  setAddressOnLocalStorage,
}: {
  titleMessage: string;
  goToNextStage: () => void;
  descriptionMessage: ReactNode;
  validAddressMessage: string;
  isValidAddress: (address?: `0x${string}`) => boolean;
  setAddressOnLocalStorage: (wallet: `0x${string}` | null) => void;
}) => {
  const { address, isConnected, chainId } = useAccount();

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2"
        >
          <span className="text-lg font-medium text-yellow-700 dark:text-yellow-400 sm:text-xl">
            {titleMessage}
            <br />
          </span>
        </motion.p>
        <p className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
          <InfoCircledIcon className="-mt-0.5 hidden size-6 min-w-4 sm:!block" />
          {descriptionMessage}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
        className="flex flex-col items-center justify-center gap-4"
      >
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />

        {isConnected && isValidAddress(address) && CHAIN_ID === chainId && (
          <Button
            className="w-[150px] !rounded-full bg-purple-500 text-sm hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
            onClick={() => {
              setAddressOnLocalStorage(address!);
              goToNextStage();
            }}
            type="button"
          >
            Confirm
          </Button>
        )}

        {isConnected && !isValidAddress(address) && (
          <p className="w-fit text-sm text-red-500 hover:text-red-600 dark:text-red-600 dark:hover:text-red-700">
            {validAddressMessage}
          </p>
        )}
      </motion.div>
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
    STORAGE_KEYS.bundleId,
    null,
  );
  const [victimAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.victimAddress,
    null,
  );
  const [receiverAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.receiverAddress,
    null,
  );
  const [selectedTokens] = useLocalStorage<Record<string, ITokenMetadata>>(
    STORAGE_KEYS.selectedTokens,
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
        const txs = await createTxs(victimAddress!, receiverAddress!, tokens);
        setTransactions(txs);
        setStage(3);
      } catch (error) {
        toast.error('Error creating transactions');
        console.error(error, 'error creating transactions');
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
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2"
        >
          <span className="text-lg font-medium text-yellow-700 dark:text-yellow-400 sm:text-xl">
            Add Flashbots Protect RPC.
            <br />
          </span>
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
        className="flex flex-col items-center justify-center gap-4"
      >
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
      </motion.div>
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
        setStage(4);
      },
      onError: () => {
        toast.error(
          'Transaction failed, Try again. If the problem persists, please refresh the page.',
        );
        setStage(1);
      },
    },
  });

  useEffectOnce(() => {
    sendTransactionAsync(transaction);
  });

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2"
        >
          <span className="text-lg font-medium text-yellow-700 dark:text-yellow-400 sm:text-xl">
            Please sign the funder transaction.
            <br />
          </span>
        </motion.p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <InfoCircledIcon className="-mt-0.5 hidden size-6 min-w-4 sm:!block" />
          <span>
            Great! You have added the Flashbots Protect RPC. Now you need to
            sign the transaction to send ETH to the victim wallet.
          </span>
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
        className="mt-8 flex flex-col items-center justify-center gap-4"
      >
        <LoadingSigning />
      </motion.div>
    </>
  );
};

const SignVictimTransactions = ({
  setStage,
  transactions,
}: {
  transactions: Tx[];
  setStage: (stage: number) => void;
}) => {
  const { sendTransactionAsync } = useSendTransaction();
  const { setStage: setNextStep } = useStageContext();

  const [bundleId] = useLocalStorage<string | null>(
    STORAGE_KEYS.bundleId,
    null,
  );

  const handleSignTransactions = useCallback(async () => {
    try {
      await Promise.all(
        transactions.map(async (tx) => {
          await sendTransactionAsync(tx);
        }),
      );
      setNextStep(3);
    } catch (error) {
      toast.error(
        'Transaction failed, Try again. If the problem persists, please refresh the page.',
      );
      setStage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, bundleId]);

  useEffectOnce(() => {
    handleSignTransactions();
  });

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2"
        >
          <span className="text-lg font-medium text-yellow-700 dark:text-yellow-400 sm:text-xl">
            Please sign the following transactions on the victim wallet.
            <br />
          </span>
        </motion.p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <InfoCircledIcon className="-mt-0.5 hidden size-6 min-w-4 sm:!block" />
          <span>
            Great! You have connected the victim wallet. Now you need to sign
            the following transactions.
          </span>
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
        className="mt-8 flex flex-col items-center justify-center gap-4"
      >
        <LoadingSigning />
      </motion.div>
    </>
  );
};

export const ConnectSignTransactions = () => {
  const uuid = uuidv4();

  const [stage, setStage] = useState<number>(1);
  const [transactions, setTransactions] = useState<Txs | null>(null);
  const [victimAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.victimAddress,
    null,
  );
  const [_, setFunderAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.funderAddress,
    null,
  );

  const stageContent = useMemo(() => {
    switch (stage) {
      case 1:
        return (
          <ConnectWallet
            goToNextStage={() => setStage(2)}
            isValidAddress={(address?: `0x${string}`) =>
              address?.toLowerCase() !== victimAddress?.toLowerCase()
            }
            setAddressOnLocalStorage={setFunderAddress}
            titleMessage="Please connect a [safe] wallet to send funds."
            descriptionMessage={
              <span>
                This wallet can be any wallet{' '}
                <span className="font-bold">
                  but the victim or hacked wallet
                </span>{' '}
                . It would be used to send ETH to the victim wallet for gas
                fees.
              </span>
            }
            validAddressMessage="You are connected to the victim wallet, please connect to a
            different wallet"
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
      case 4:
        return (
          <ConnectWallet
            goToNextStage={() => setStage(5)}
            isValidAddress={(address?: `0x${string}`) =>
              address?.toLowerCase() === victimAddress?.toLowerCase()
            }
            setAddressOnLocalStorage={setFunderAddress}
            titleMessage="Please connect Victim wallet to sign transactions."
            descriptionMessage={
              <span>
                You would now need to connect the{' '}
                <span className="font-bold">victim wallet</span> to sign the
                remaining set of transactions.
              </span>
            }
            validAddressMessage="You are not connected to the victim wallet, please connect to the victim wallet"
          />
        );
      case 5:
        return (
          <SignVictimTransactions
            setStage={setStage}
            transactions={transactions?.victim!}
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
