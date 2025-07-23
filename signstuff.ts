import { getContract } from 'viem';
import {
  privateKeyToAccount,
  SignAuthorizationReturnType,
  nonceManager,
} from 'viem/accounts';

import rescuroorAbi from '@/lib/constants/abis/rescurooor.json';
import { web3Service } from '@/lib/services/web3';

const compromisedKey =
  '0x380c64ec8bb228fe5885da71c111ebb08b033bf1e22e1d1b0c507083239bda7b';
const eoa = privateKeyToAccount(compromisedKey, { nonceManager });

async function signStuff() {
  const chainId = 97;
  const walletClient = web3Service.getWalletClient(chainId);
  const publicClient = web3Service.getPublicClient(chainId);

  let authorization: SignAuthorizationReturnType | undefined;
  let nonce: bigint;

  const isDelegated = await web3Service.isDelegated(eoa.address, chainId);

  if (!isDelegated) {
    authorization = await walletClient.signAuthorization({
      account: eoa,
      contractAddress: process.env.RESCUROOOR_CONTRACT_ADDRESS as `0x${string}`,
    });
    nonce = BigInt(0);
  } else {
    const rescuroorDelegate = getContract({
      address: eoa.address as `0x${string}`,
      abi: rescuroorAbi,
      client: publicClient,
    });
    console.log('rescuroorDelegate', rescuroorDelegate.address);
    console.log('eoa', eoa.address);
    nonce = (await rescuroorDelegate.read.nonces([eoa.address], {
      blockTag: 'latest',
    })) as bigint;
  }

  console.log('nonce', nonce);

  // "RescueErc20(address caller,address recipient,address[] tokens,uint256 deadline,uint256 nonce)";
  const signature = await eoa.signTypedData({
    domain: {
      name: 'Rescuerooor',
      version: '1',
      chainId,
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
      recipient: '0xd8Ee094FeB76A51dFE00e08Fbb1206c8b4B54D8E',
      tokens: ['0x21B1c11d5e7f6B8Cd07be8886b196319fc69e558'],
      deadline: BigInt(5555555555555555),
      nonce,
    },
  });

  return {
    signature,
    authorization: !isDelegated
      ? `${
          (authorization?.r || '') + (authorization?.s.slice(2) || '')
        }0${authorization?.yParity?.toString(16) || ''}`
      : '',
    deadline: 5555555555555555,
    nonce: authorization?.nonce,
  };
}

export default signStuff;

// Sepolia
// {
//     "authorization": "0xc23a1ed5670b4637ae20f1e3869049e4881dde84ec69344ffcde94d51ce9b5577915d2ec59a7877d7c90c354354203d59da1f561d7b838c9a82e4ff904d2a4f401",
//     "eip712Signature": "0x0b06089ad41751fd41ff470b94b709078b6a38399e0b4dc8437a393ba12fdd2f5e14f3625eda5a30adc53af5ea90fab98b3011c97f9db3a213a28ca151243c5d1b",
//     "tokens": ["0xBd1899694F09EbcF2a1F3bB2DB74E570d894FC5d"],
//     "deadline": 5555555555555555,
//     "receiverWallet": "0xd8Ee094FeB76A51dFE00e08Fbb1206c8b4B54D8E",
//     "gasTransactionHash": "0xc18ba23c0557d757f1562f034635f9323271528ff6be1acf074998461f94eb11",
//     "compromisedAddress": "0x1aB89d35d120c22B44acd9CA44298b5BE8681927",
//     "chainId": 11155111,
//     "nonce": 10
// }

// BSC Testnet
