import { encodePacked, keccak256 } from 'viem';
import {
  privateKeyToAccount,
  SignAuthorizationReturnType,
  nonceManager,
} from 'viem/accounts';
import { getStorageAt } from 'viem/actions';

import { web3Service } from '@/lib/services/web3';

const compromisedKey =
  '0x42bce5e31f0a9955a02287a1aa838f4ce312ac28273f108a065107c0bf9b811d';
const eoa = privateKeyToAccount(compromisedKey, { nonceManager });

async function signStuff() {
  const chainId = 84532;
  const walletClient = web3Service.getWalletClient(chainId);
  const publicClient = web3Service.getPublicClient(chainId);

  let authorization: SignAuthorizationReturnType | undefined;

  const isDelegated = await web3Service.isDelegated(eoa.address, chainId);

  if (!isDelegated) {
    authorization = await walletClient.signAuthorization({
      account: eoa,
      contractAddress: process.env.RESCUROOOR_CONTRACT_ADDRESS as `0x${string}`,
    });
  }

  // This method is used to get the nonce in case if a wallet formerly delegated to the Rescuerooor contract has been redelegated
  // to a different address.
  const slotPosition = BigInt(2); // slot position of the nonces mapping in Rescuerooor contract
  // Encode packed data
  const encoded = encodePacked(
    ['uint256', 'uint256'], // Use 'address' type for the first parameter
    [BigInt(eoa.address), slotPosition],
  );

  // Hash the encoded data
  const nonceSlotPosition = keccak256(encoded);

  const nonce = await getStorageAt(publicClient, {
    address: eoa.address,
    slot: nonceSlotPosition,
  });

  console.log('nonce', BigInt(nonce || 0));

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
      recipient: '0x3FE8A6792047D5893ae49c65dFb0fA66aa286802',
      tokens: ['0xbc65d0eE71E10e935eF9E35bD3bA333C898b08de'],
      deadline: BigInt(1e18),
      nonce: BigInt(nonce || 0),
    },
  });

  return {
    signature,
    authorization: !isDelegated
      ? `${
          (authorization?.r || '') + (authorization?.s.slice(2) || '')
        }0${authorization?.yParity?.toString(16) || ''}`
      : '',
    deadline: 1e18,
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
