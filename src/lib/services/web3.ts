import axios from 'axios';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  encodeFunctionData,
  type PublicClient,
  type WalletClient,
  type Address,
} from 'viem';
import {
  privateKeyToAccount,
  SignAuthorizationReturnType,
} from 'viem/accounts';

import { getRpcUrl, getNetworkConfig } from '../../configs/networks';
import { getMode } from '../../configs/supabase';
import rescurooorAbi from '../../constants/abis/rescurooor.json';

/**
 * Web3Service with chain-specific wallet clients
 *
 * This service provides separate wallet clients for each supported chain,
 * while they all share the same wallet address (derived from the same private key).
 *
 * Benefits:
 * - Better isolation: Each chain has its own client with chain-specific configuration
 * - Improved reliability: Issues with one chain don't affect others
 * - Chain-specific optimizations: Each client can be configured for its specific network
 * - Shared identity: All clients use the same wallet address for consistency
 *
 * Architecture:
 * - One account (derived from BACKEND_PRIVATE_KEY) shared across all chains
 * - Separate public clients for each chain (for read operations)
 * - Separate wallet clients for each chain (for write operations)
 * - All clients use the same wallet address but with chain-specific RPC endpoints
 */
export class Web3Service {
  private publicClients: Map<number, PublicClient> = new Map();

  private walletClients: Map<number, WalletClient> = new Map();

  private mode: 'production' | 'test';

  private account: ReturnType<typeof privateKeyToAccount> | null = null;

  constructor() {
    this.mode = getMode();
    this.initializeClients();
  }

  private initializeClients() {
    const { networks } = getNetworkConfig(this.mode);

    // Initialize the account from private key (shared across all chains)
    const privateKey = process.env.BACKEND_PRIVATE_KEY as `0x${string}`;
    if (!privateKey) {
      throw new Error('BACKEND_PRIVATE_KEY environment variable is required');
    }
    this.account = privateKeyToAccount(privateKey);

    // Initialize public and wallet clients for each chain
    Object.entries(networks).forEach(([name, chain]) => {
      const rpcUrl = getRpcUrl(name, this.mode);

      // Create public client for this chain
      const publicClient = createPublicClient({
        chain,
        transport: http(rpcUrl),
      });
      this.publicClients.set(chain.id, publicClient as PublicClient);

      // Create wallet client for this chain (shares the same account)
      const walletClient = createWalletClient({
        account: this.account!,
        transport: http(rpcUrl),
        chain,
      });
      this.walletClients.set(chain.id, walletClient);
    });
  }

  public getPublicClient(chainId: number): PublicClient {
    const client = this.publicClients.get(chainId);
    if (!client) {
      throw new Error(`No public client found for chain ID: ${chainId}`);
    }
    return client;
  }

  public getWalletClient(chainId: number): WalletClient {
    const client = this.walletClients.get(chainId);
    if (!client) {
      throw new Error(`No wallet client found for chain ID: ${chainId}`);
    }
    return client;
  }

  public getAccount(): ReturnType<typeof privateKeyToAccount> {
    if (!this.account) {
      throw new Error('Account not initialized');
    }
    return this.account;
  }

  public async getLatestBlockNumber(chainId: number): Promise<bigint> {
    const client = this.getPublicClient(chainId);
    return client.getBlockNumber();
  }

  public async getTransaction(hash: `0x${string}`, chainId: number) {
    const client = this.getPublicClient(chainId);
    return client.getTransaction({ hash });
  }

  public async getBalance(address: Address, chainId: number): Promise<bigint> {
    const client = this.getPublicClient(chainId);
    return client.getBalance({ address });
  }

  /**
   * Parse RSV format authorization and create authorization data for EIP 7702
   */
  public static parseAuthorization(
    authorization: string,
    nonce: number,
    chainId: number,
    contractAddress: string,
  ): SignAuthorizationReturnType {
    // Remove '0x' prefix if present
    const cleanAuth = authorization.startsWith('0x')
      ? authorization.slice(2)
      : authorization;

    // RSV format: 65 bytes = 32 bytes (r) + 32 bytes (s) + 1 byte (v)
    if (cleanAuth.length !== 130) {
      throw new Error(
        'Invalid authorization format: expected 65 bytes (130 hex characters)',
      );
    }

    const r = `0x${cleanAuth.slice(0, 64)}`;
    const s = `0x${cleanAuth.slice(64, 128)}`;
    const v = parseInt(cleanAuth.slice(128, 130), 16);

    return {
      nonce,
      chainId,
      address: contractAddress as Address,
      r: r as `0x${string}`,
      s: s as `0x${string}`,
      yParity: v,
    };
  }

  public async estimateGasForRescue(
    chainId: number,
    compromisedAddress: Address,
    recipient: Address,
    tokens: Address[],
    deadline: bigint,
    signature: `0x${string}`,
    authorization: `0x${string}` | '',
    nonce: number,
  ): Promise<bigint> {
    const publicClient = this.getPublicClient(chainId);
    const walletClient = this.getWalletClient(chainId);

    // Get contract address from environment
    const contractAddress = process.env.RESCUROOOR_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Rescurooor contract address not configured');
    }

    let authorizationList: SignAuthorizationReturnType[] = [];
    if (authorization) {
      // Parse authorization and create authorization list
      const authorizationData = Web3Service.parseAuthorization(
        authorization,
        nonce,
        chainId,
        contractAddress,
      );
      authorizationList = [authorizationData];
    }

    // Encode the rescue_erc20 function data
    const data = encodeFunctionData({
      abi: rescurooorAbi,
      functionName: 'rescue_erc20',
      args: [recipient, tokens, deadline, signature],
    });

    let estimatedGas;
    // Estimate gas for the transaction to the compromised address
    // can't send empty authorizationList
    if (authorizationList.length > 0) {
      estimatedGas = await publicClient.estimateGas({
        to: compromisedAddress,
        data,
        account: walletClient.account,
        authorizationList,
      });
    } else {
      estimatedGas = await publicClient.estimateGas({
        to: compromisedAddress,
        data,
        account: walletClient.account,
      });
    }
    return estimatedGas;
  }

  public async sendRescueTransaction(
    chainId: number,
    compromisedAddress: Address,
    recipient: Address,
    tokens: Address[],
    deadline: bigint,
    signature: `0x${string}`,
    authorization: `0x${string}` | '',
    nonce: number, // authorization nonce (compromised address nonce)
    gasLimit: bigint,
    maxFeePerGas: bigint,
    maxPriorityFeePerGas: bigint,
  ): Promise<`0x${string}`> {
    const walletClient = this.getWalletClient(chainId);

    // Get contract address from environment
    const contractAddress = process.env.RESCUROOOR_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Rescurooor contract address not configured');
    }
    let authorizationList: SignAuthorizationReturnType[] = [];
    if (authorization) {
      // Parse authorization and create authorization list
      const authorizationData = Web3Service.parseAuthorization(
        authorization,
        nonce,
        chainId,
        contractAddress,
      );
      authorizationList = [authorizationData];
    }

    // Encode the rescue_erc20 function data
    const data = encodeFunctionData({
      abi: rescurooorAbi,
      functionName: 'rescue_erc20',
      args: [recipient, tokens, deadline, signature],
    });

    // Send transaction to the compromised address with authorization
    // can't send empty authorizationList
    let hash;
    if (authorizationList.length > 0) {
      hash = await walletClient.sendTransaction({
        to: compromisedAddress,
        data,
        gas: gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
        account: this.account,
        chain: walletClient.chain,
        authorizationList,
      });
    } else {
      hash = await walletClient.sendTransaction({
        to: compromisedAddress,
        data,
        gas: gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
        account: this.account,
        chain: walletClient.chain,
      });
    }
    return hash;
  }

  public async getTransactionReceipt(hash: `0x${string}`, chainId: number) {
    const client = this.getPublicClient(chainId);
    return client.waitForTransactionReceipt({ hash });
  }

  public async getGasPrice(chainId: number): Promise<bigint> {
    const client = this.getPublicClient(chainId);
    return client.getGasPrice();
  }

  public static parseEther(amount: string): bigint {
    return parseEther(amount);
  }

  public static formatEther(amount: bigint): string {
    return formatEther(amount);
  }

  public async isDelegated(
    address: Address,
    chainId: number,
  ): Promise<boolean> {
    const publicClient = this.getPublicClient(chainId);
    // eth_getCode is called directly because publicClient.getCode does not return the bytecode of delegated addresses
    // but it returns it if a second call is done with publicClient.getCode
    const response = await axios.post(
      publicClient.transport.url,
      {
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [address, 'latest'],
        id: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const bytecode = response.data.result;
    if (!bytecode) {
      return false;
    }
    return (
      bytecode ===
      `0xef0100${process.env.RESCUROOOR_CONTRACT_ADDRESS?.slice(2)}`.toLowerCase()
    );
  }

  // Convert gas units to ETH value
  public async gasToEth(
    gasUnits: bigint,
    chainId: number,
  ): Promise<{ gasInEth: bigint; priorityFee: bigint }> {
    const publicClient = this.getPublicClient(chainId);
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await publicClient.estimateFeesPerGas();

    console.log('maxFeePerGas', maxFeePerGas);
    console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);

    return {
      gasInEth: gasUnits * maxFeePerGas,
      priorityFee: maxPriorityFeePerGas,
    };
  }

  // Convert ETH value to gas units
  public async ethToGas(ethValue: bigint, chainId: number): Promise<bigint> {
    const gasPrice = await this.getGasPrice(chainId);
    return ethValue / gasPrice;
  }

  // Get all supported chain IDs
  public getSupportedChainIds(): number[] {
    return Array.from(this.publicClients.keys());
  }

  // Check if a chain is supported
  public isChainSupported(chainId: number): boolean {
    return this.publicClients.has(chainId);
  }

  // Get the wallet address (same across all chains)
  public getWalletAddress(): Address {
    return this.getAccount().address;
  }
}

export const web3Service = new Web3Service();
