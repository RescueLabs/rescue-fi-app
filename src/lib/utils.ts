import { type ClassValue, clsx } from 'clsx';
import { Wallet } from 'ethers';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getWalletAddressFromPrivateKey = (privateKey: string) => {
  try {
    const wallet = new Wallet(privateKey);

    return wallet.address;
  } catch (error) {
    return '';
  }
};
