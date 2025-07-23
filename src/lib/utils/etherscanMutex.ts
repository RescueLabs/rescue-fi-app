// Mutex implementation for Etherscan operations with queuing support
export class EtherscanMutex {
  private locked = false;

  private currentChain: number | null = null;

  private lockTime: number | null = null;

  private queue: Array<{
    resolve: (value: boolean) => void;
    reject: (error: Error) => void;
    chainId: number;
  }> = [];

  private readonly TIMEOUT_MS = 15000; // 15 seconds timeout

  async acquire(chainId: number): Promise<boolean> {
    // Check for timeout on existing lock
    if (this.locked && this.lockTime) {
      const elapsed = Date.now() - this.lockTime;
      if (elapsed > this.TIMEOUT_MS) {
        console.warn(
          `Etherscan mutex timeout detected for chain: ${chainId}, forcing release`,
        );
        this.forceRelease();
      }
    }

    if (!this.locked) {
      this.locked = true;
      this.currentChain = chainId;
      this.lockTime = Date.now();
      return true;
    }

    // If already locked, queue the request
    return new Promise<boolean>((resolve, reject) => {
      this.queue.push({ resolve, reject, chainId });
      console.log(`Queued Etherscan operation for chain: ${chainId}`);
    });
  }

  release(): void {
    this.locked = false;
    this.currentChain = null;
    this.lockTime = null;

    // Process next queued request if any
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        this.locked = true;
        this.currentChain = next.chainId;
        this.lockTime = Date.now();
        next.resolve(true);
        console.log(
          `Processed queued Etherscan operation for chain: ${next.chainId}`,
        );
      }
    }
  }

  forceRelease(): void {
    this.locked = false;
    this.currentChain = null;
    this.lockTime = null;

    // Reject all queued requests
    this.queue.forEach(({ reject }) => {
      reject(new Error('Mutex force released'));
    });
    this.queue = [];
  }

  getCurrentChain(): number | null {
    return this.currentChain;
  }

  isLocked(): boolean {
    return this.locked;
  }

  getLockDuration(): number | null {
    if (this.locked && this.lockTime) {
      return Date.now() - this.lockTime;
    }
    return null;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
