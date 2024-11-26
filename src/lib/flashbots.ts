import MevShareClient from '@flashbots/mev-share-client';
import { JsonRpcProvider, Wallet } from 'ethers';

export const getSepoliaMevShareClient = (
  privateKey: string,
  rpcUrl: string,
) => {
  const provider = new JsonRpcProvider(rpcUrl);
  const authSigner = new Wallet(privateKey, provider);

  return new MevShareClient(authSigner, {
    streamUrl: 'https://mev-share-sepolia.flashbots.net',
    apiUrl: 'https://relay-sepolia.flashbots.net',
  });
};

export const getEthereumMevShareClient = (
  privateKey: string,
  rpcUrl: string,
) => {
  const provider = new JsonRpcProvider(rpcUrl);
  const authSigner = new Wallet(privateKey, provider);

  return new MevShareClient(authSigner, {
    streamUrl: 'https://mev-share.flashbots.net',
    apiUrl: 'https://relay.flashbots.net',
  });
};
