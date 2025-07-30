import { InfoCircledIcon } from '@radix-ui/react-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IconLoader2 } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { encodeFunctionData, formatEther } from 'viem';
import { SignAuthorizationReturnType } from 'viem/actions';
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ACCEPTED_CHAIN_MAP, QUERY_KEYS, STORAGE_KEYS } from '@/constants';
import RESCUER_ABI from '@/constants/abis/rescuer.json';
import { useFinalBundleContext } from '@/context/final-bundle-context';
import { useStageContext } from '@/context/stage-context';
import {
  deserializeBigInt,
  getPrivateKeyAccount,
  getWalletClient,
  serializeBigInt,
} from '@/lib/utils';
import { ITokenMetadata } from '@/types/tokens';

const ConnectSponsorWallet = ({
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

        {isConnected &&
          isValidAddress(address) &&
          chainId &&
          ACCEPTED_CHAIN_MAP.has(chainId) && (
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

const CalculateGasFeesAndSendFunds = ({
  authorizationSignature,
  eip712Signature,
  rescueTokenAddresses,
  deadline,
  victimWalletAddress,
  receiverWalletAddress,
  authorizationNonce,
}: {
  authorizationSignature: SignAuthorizationReturnType | null;
  eip712Signature: string | null;
  rescueTokenAddresses: `0x${string}`[];
  deadline: bigint;
  victimWalletAddress: `0x${string}` | null;
  receiverWalletAddress: `0x${string}` | null;
  authorizationNonce: bigint;
}) => {
  const { setFinalBundle } = useFinalBundleContext();
  const { setStage: setCentralStage } = useStageContext();

  const _authorizationSignature = useMemo(
    () =>
      `${
        (authorizationSignature?.r || '') +
        (authorizationSignature?.s.slice(2) || '')
      }0${authorizationSignature?.yParity?.toString(16) || ''}`,
    [authorizationSignature],
  );

  const rescueErc20Data = useMemo(
    () =>
      encodeFunctionData({
        abi: RESCUER_ABI,
        functionName: 'rescue_erc20',
        args: [
          receiverWalletAddress!,
          rescueTokenAddresses,
          deadline,
          eip712Signature!,
        ],
      }),
    [],
  );

  const { chain } = useAccount();

  const { data: gasData, isLoading: isGasDataLoading } = useQuery<{
    gasInEth: string;
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
  }>({
    queryKey: [QUERY_KEYS.estimateGas, victimWalletAddress],
    queryFn: async () => {
      const response = await axios.get(
        `/api/estimateGas?chainId=${chain?.id}&data=${rescueErc20Data}&compromisedAddress=${victimWalletAddress}&authorization=${_authorizationSignature}&nonce=${authorizationNonce}`,
      );
      return response.data as Promise<{
        gasInEth: string;
        maxPriorityFeePerGas: string;
        maxFeePerGas: string;
      }>;
    },
    enabled:
      !!victimWalletAddress &&
      !!_authorizationSignature &&
      authorizationNonce >= BigInt(0) &&
      !!chain &&
      !!rescueErc20Data,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const rescueErc20Gas = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 9,
        maximumFractionDigits: 9,
      }).format(Number(formatEther(BigInt(gasData?.gasInEth || '0')))),
    [gasData],
  );

  const {
    data: sendTransactionData,
    sendTransaction,
    isPending: isSendingRescueErc20Gas,
  } = useSendTransaction({});

  const {
    data: gasTransactionReceipt,
    isLoading: isTransactionReceiptLoading,
  } = useWaitForTransactionReceipt({
    hash: sendTransactionData,
  });

  useEffect(() => {
    if (
      gasTransactionReceipt &&
      chain?.id &&
      receiverWalletAddress &&
      victimWalletAddress &&
      eip712Signature &&
      _authorizationSignature &&
      rescueTokenAddresses?.length > 0
    ) {
      setFinalBundle({
        authorization: _authorizationSignature,
        eip712Signature: eip712Signature!,
        tokens: rescueTokenAddresses,
        deadline: Number(deadline),
        receiverWallet: receiverWalletAddress!,
        compromisedAddress: victimWalletAddress!,
        chainId: chain.id,
        gasTransactionHash: gasTransactionReceipt.transactionHash,
        nonce: Number(authorizationSignature?.nonce),
      });

      setCentralStage(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasTransactionReceipt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
      className="flex flex-col items-center justify-center gap-8"
    >
      <div className="space-y-3 text-center text-white">
        <p className="text-md flex justify-center text-gray-500 dark:text-gray-400">
          <InfoCircledIcon className="hidden size-6 min-w-4 sm:!block" />
          <div className="flex flex-col gap-3">
            <span>
              You have connected a safe wallet to send funds. Now you need to
              send gas fees to rescue the selected tokens.
            </span>
            <span className="text-lg">
              The amount of gas fees is{' '}
              <span className="font-bold text-purple-500">
                {isGasDataLoading && !gasData ? (
                  <Skeleton className="mr-1 inline-block h-4 w-8" />
                ) : (
                  `${rescueErc20Gas} `
                )}
                ETH
              </span>
              .
            </span>
          </div>
        </p>
      </div>

      <Button
        className="w-[226px] !rounded-full bg-purple-500 text-sm hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
        onClick={() => {
          sendTransaction({
            to: process.env.BACKEND_WALLET_ADDRESS as `0x${string}`,
            data: victimWalletAddress!,
            value: gasData?.gasInEth ? BigInt(gasData.gasInEth) : BigInt(0),
          });
        }}
        type="button"
        disabled={
          isSendingRescueErc20Gas || !gasData || isTransactionReceiptLoading
        }
      >
        {isSendingRescueErc20Gas || isTransactionReceiptLoading ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          'Send Funds'
        )}
      </Button>
    </motion.div>
  );
};

export const ConnectSignTransactions = () => {
  const { chain } = useAccount();

  const [stage, setStage] = useState<number>(1);
  const [victimWalletAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.victimAddress,
    null,
  );
  const [victimPrivateKey] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.victimPrivateKey,
    null,
  );
  const [selectedTokens] = useLocalStorage<Record<string, ITokenMetadata>>(
    STORAGE_KEYS.selectedTokens,
    {},
  );
  const [receiverWalletAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.receiverAddress,
    null,
  );
  const [_, setFunderAddress] = useLocalStorage<`0x${string}` | null>(
    STORAGE_KEYS.funderAddress,
    null,
  );
  const [authorizationSignature, setAuthorizationSignature] =
    useLocalStorage<SignAuthorizationReturnType | null>(
      STORAGE_KEYS.authorizationSignature,
      null,
      {
        serializer: (value) => serializeBigInt(value),
        deserializer: (value) => deserializeBigInt(value),
      },
    );
  const [eip712Signature, setEip712Signature] = useLocalStorage<string | null>(
    STORAGE_KEYS.eip712Signature,
    null,
  );

  const { data: delegatedDetails } = useQuery<{
    isDelegated: boolean;
    nonce: string;
  }>({
    queryKey: [QUERY_KEYS.delegatedDetails, victimWalletAddress, chain?.id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/address/${victimWalletAddress}/delegated?chainId=${chain?.id}`,
      );
      return response.data as {
        isDelegated: boolean;
        nonce: string;
      };
    },
    enabled: !!victimWalletAddress && !!chain?.id,
  });

  const rescueTokenAddresses = useMemo(
    () => Object.values(selectedTokens).map((token) => token.address),
    [selectedTokens],
  );

  const deadline = useMemo(
    () => BigInt(1e18), // 20 minutes from now (in seconds)
    [],
  );

  const signAuthorization = useCallback(async (): Promise<
    SignAuthorizationReturnType | undefined
  > => {
    if (!victimPrivateKey || !chain) return;

    const eoa = getPrivateKeyAccount(victimPrivateKey);
    if (!eoa) return;

    const walletClient = getWalletClient(victimPrivateKey, chain);
    if (!walletClient) {
      toast.error('Failed to get wallet client');
      return;
    }

    const authorization = await walletClient.signAuthorization({
      account: eoa,
      contractAddress: process.env.RESCUROOOR_CONTRACT_ADDRESS as `0x${string}`,
    });

    return authorization;
  }, [victimPrivateKey, chain]);

  const signEIP712Signature = useCallback(async (): Promise<
    string | undefined
  > => {
    if (
      !victimPrivateKey ||
      !chain ||
      !victimWalletAddress ||
      !receiverWalletAddress ||
      !delegatedDetails
    ) {
      console.log('Missing required data:', {
        victimPrivateKey: !!victimPrivateKey,
        chain: !!chain,
        victimWalletAddress: !!victimWalletAddress,
        receiverWalletAddress: !!receiverWalletAddress,
        delegatedDetails: !!delegatedDetails,
      });
      return;
    }

    const eoa = getPrivateKeyAccount(victimPrivateKey);
    if (!eoa) return;

    const signedTypedData = await eoa.signTypedData({
      domain: {
        name: 'Rescuerooor',
        version: '1',
        chainId: chain.id,
        verifyingContract: eoa.address,
      },
      types: {
        RescueErc20: [
          { name: 'caller', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'tokens', type: 'address[]' },
          { name: 'deadline', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
      primaryType: 'RescueErc20',
      message: {
        caller: process.env.BACKEND_WALLET_ADDRESS as `0x${string}`,
        recipient: receiverWalletAddress,
        tokens: rescueTokenAddresses,
        deadline,
        nonce: BigInt(delegatedDetails?.nonce || '-1'),
      },
    });

    return signedTypedData;
  }, [
    victimPrivateKey,
    delegatedDetails,
    chain,
    rescueTokenAddresses,
    receiverWalletAddress,
    victimWalletAddress,
    deadline,
  ]);

  const signAuthorizations = useCallback(async () => {
    const _authorization = await signAuthorization();
    const _eip712Signature = await signEIP712Signature();

    if (!_authorization || !_eip712Signature) {
      return;
    }

    setAuthorizationSignature(_authorization);
    setEip712Signature(_eip712Signature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signAuthorization, signEIP712Signature, delegatedDetails]);

  const stageContent = useMemo(() => {
    switch (stage) {
      case 1:
        return (
          <ConnectSponsorWallet
            goToNextStage={async () => {
              if (!delegatedDetails) {
                toast.info('Please wait a little for wallet delegation');
                return;
              }

              await signAuthorizations();

              setStage(2);
            }}
            isValidAddress={(address?: `0x${string}`) =>
              address?.toLowerCase() !== victimWalletAddress?.toLowerCase()
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
          authorizationSignature &&
          eip712Signature && (
            <CalculateGasFeesAndSendFunds
              authorizationSignature={authorizationSignature}
              eip712Signature={eip712Signature}
              rescueTokenAddresses={rescueTokenAddresses}
              deadline={deadline}
              victimWalletAddress={victimWalletAddress}
              receiverWalletAddress={receiverWalletAddress}
              authorizationNonce={BigInt(delegatedDetails?.nonce || '0')}
            />
          )
        );
      default:
        return 'Unknown stage';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, authorizationSignature, eip712Signature, delegatedDetails]);

  return (
    <div className="flex flex-col gap-8">
      <h4 className="text-center text-xl font-semibold sm:text-2xl">
        Connect Wallets & Sign Transactions
      </h4>
      {stageContent}
    </div>
  );
};
