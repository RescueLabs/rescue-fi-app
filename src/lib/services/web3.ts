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

import { getRpcUrl, getNetworkConfig } from '../config/networks';
import { getMode } from '../config/supabase';
import rescurooorAbi from '../constants/abis/rescurooor.json';

export class Web3Service {
  private publicClients: Map<number, PublicClient> = new Map();

  private walletClient: WalletClient | null = null;

  private mode: 'production' | 'test';

  constructor() {
    this.mode = getMode();
    this.initializeClients();
  }

  private initializeClients() {
    const { networks } = getNetworkConfig(this.mode);

    Object.entries(networks).forEach(([name, chain]) => {
      const rpcUrl = getRpcUrl(name, this.mode);
      const publicClient = createPublicClient({
        chain,
        transport: http(rpcUrl),
      });
      this.publicClients.set(chain.id, publicClient);
    });

    // Initialize wallet client with backend private key
    const privateKey = process.env.BACKEND_PRIVATE_KEY as `0x${string}`;
    if (privateKey) {
      const account = privateKeyToAccount(privateKey);
      this.walletClient = createWalletClient({
        account,
        transport: http(),
      });
    }
  }

  public getPublicClient(chainId: number): PublicClient {
    const client = this.publicClients.get(chainId);
    if (!client) {
      throw new Error(`No public client found for chain ID: ${chainId}`);
    }
    return client;
  }

  public getWalletClient(): WalletClient {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }
    return this.walletClient;
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
    authorization: `0x${string}`,
    nonce: number,
  ): Promise<bigint> {
    const client = this.getPublicClient(chainId);

    // Get contract address from environment
    const contractAddress = process.env.RESCUROOR_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Rescurooor contract address not configured');
    }

    // Parse authorization and create authorization list
    const authorizationData = Web3Service.parseAuthorization(
      authorization,
      nonce,
      chainId,
      contractAddress,
    );
    const authorizationList = [authorizationData];

    // Encode the rescue_erc20 function data
    const data = encodeFunctionData({
      abi: rescurooorAbi,
      functionName: 'rescue_erc20',
      args: [recipient, tokens, deadline, signature],
    });

    // Estimate gas for the transaction to the compromised address
    const estimatedGas = await client.estimateGas({
      to: compromisedAddress,
      data,
      account: this.getWalletClient().account,
      authorizationList,
    });

    return estimatedGas;
  }

  public async sendRescueTransaction(
    chainId: number,
    compromisedAddress: Address,
    recipient: Address,
    tokens: Address[],
    deadline: bigint,
    signature: `0x${string}`,
    authorization: `0x${string}`,
    nonce: number,
    gasLimit: bigint,
    maxFeePerGas: bigint,
    maxPriorityFeePerGas: bigint,
  ): Promise<`0x${string}`> {
    const walletClient = this.getWalletClient();
    const publicClient = this.getPublicClient(chainId);

    // Get contract address from environment
    const contractAddress = process.env.RESCUROOR_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Rescurooor contract address not configured');
    }

    // Parse authorization and create authorization list
    const authorizationData = Web3Service.parseAuthorization(
      authorization,
      nonce,
      chainId,
      contractAddress,
    );
    const authorizationList = [authorizationData];

    // Encode the rescue_erc20 function data
    const data = encodeFunctionData({
      abi: rescurooorAbi,
      functionName: 'rescue_erc20',
      args: [recipient, tokens, deadline, signature],
    });

    // Send transaction to the compromised address with authorization
    const hash = await walletClient.sendTransaction({
      to: compromisedAddress,
      data,
      gas: gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      chain: publicClient.chain,
      account: walletClient.account!,
      authorizationList,
    });

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

  // Convert gas units to ETH value
  public async gasToEth(
    gasUnits: bigint,
    chainId: number,
  ): Promise<{ gasInEth: bigint; priorityFee: bigint }> {
    const publicClient = this.getPublicClient(chainId);
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await publicClient.estimateFeesPerGas();

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
}

export const web3Service = new Web3Service();
