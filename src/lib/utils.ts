import { type ClassValue, clsx } from 'clsx';
import { Wallet } from 'ethers';
import { twMerge } from 'tailwind-merge';
import { http, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getWalletAddressFromPrivateKey = (privateKey: string) => {
  try {
    const wallet = new Wallet(privateKey);

    return wallet.address;
  } catch (error) {
    return '';
  }
};

export const getPublicClient = () => {
  return createPublicClient({
    chain: sepolia,
    transport: http(),
  });
};

export const validateTokenAddress = (tokenAddress: string) => {
  return (
    tokenAddress?.length === 42 && /^0x[0-9a-fA-F]{40}$/.test(tokenAddress)
  );
};

export const validatePrivateKey = (privateKey: string) => {
  const isFirstValid =
    privateKey?.length === 66 && /^0x[0-9a-fA-F]{64}$/.test(privateKey);

  if (!isFirstValid) return false;

  try {
    const wallet = new Wallet(privateKey);
    return wallet.address !== '';
  } catch (error) {
    return false;
  }
};

export const getPrivateKeyAccount = (privateKey: string) => {
  if (!validatePrivateKey(privateKey)) return null;

  return privateKeyToAccount(privateKey as `0x${string}`);
};

export const roundToFiveDecimals = (value: number) => {
  return Math.ceil(Number(value) * 10 ** 5) / 10 ** 5;
};
