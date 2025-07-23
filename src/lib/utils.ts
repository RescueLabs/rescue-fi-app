import { type ClassValue, clsx } from 'clsx';
import { Wallet } from 'ethers';
import { twMerge } from 'tailwind-merge';
import { http, createPublicClient, createWalletClient, Chain } from 'viem';
import { privateKeyToAccount, nonceManager } from 'viem/accounts';
import { sepolia } from 'viem/chains';

import { rawWalletConfig } from '@/configs/wallet';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getWalletAddressFromPrivateKey = (
  privateKey: string,
): `0x${string}` => {
  try {
    const wallet = new Wallet(privateKey);

    return wallet.address as `0x${string}`;
  } catch (error) {
    return '0x' as `0x${string}`;
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

  return privateKeyToAccount(privateKey as `0x${string}`, { nonceManager });
};

export const getWalletClient = (privateKey: `0x${string}`, chain: Chain) => {
  const account = getPrivateKeyAccount(privateKey);
  if (!account) return null;

  return createWalletClient({
    chain,
    account,
    transport: rawWalletConfig.transports[chain.id] || http(),
  });
};

export const isValidPrivateKey = (privateKey: string): boolean => {
  try {
    privateKeyToAccount(privateKey as `0x${string}`, { nonceManager });
    return true;
  } catch {
    return false;
  }
};

export const roundToFiveDecimals = (value: number) => {
  return Math.ceil(Number(value) * 10 ** 5) / 10 ** 5;
};

export const serializeBigInt = (obj: any): string =>
  JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value,
  );

export const deserializeBigInt = (str: string): any =>
  JSON.parse(str, (_, value) => {
    if (typeof value === 'string' && /^\d+$/.test(value) && value.length > 15) {
      return BigInt(value);
    }
    return value;
  });
