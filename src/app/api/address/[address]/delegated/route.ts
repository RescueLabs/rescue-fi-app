import { NextRequest, NextResponse } from 'next/server';
import { encodePacked, keccak256 } from 'viem';
import { getStorageAt } from 'viem/actions';

import { Web3Service } from '@/lib/services/web3';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: `0x${string}` } },
) {
  const { address } = params;
  const chainIdStr = request.nextUrl.searchParams.get('chainId');

  if (!chainIdStr) {
    return NextResponse.json(
      { error: 'Chain ID is required' },
      { status: 400 },
    );
  }

  const chainId = Number(chainIdStr);

  const web3Service = new Web3Service();
  const isDelegated = await web3Service.isDelegated(address, Number(chainId));
  const publicClient = web3Service.getPublicClient(Number(chainId));

  const slotPosition = BigInt(2); // slot position of the nonces mapping in Rescuerooor contract
  // Encode packed data
  const encoded = encodePacked(
    ['uint256', 'uint256'], // Use 'address' type for the first parameter
    [BigInt(address), slotPosition],
  );

  // Hash the encoded data
  const nonceSlotPosition = keccak256(encoded);

  const nonceHex = await getStorageAt(publicClient, {
    address,
    slot: nonceSlotPosition,
  });

  const nonce = Number(nonceHex);

  return NextResponse.json({
    isDelegated,
    nonce,
  });
}
