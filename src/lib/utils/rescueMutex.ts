// Mutex implementation for rescue operations (no queuing)
export class RescueMutex {
  private locked = false;

  private currentAddress: string | null = null;

  private lockTime: number | null = null;

  private readonly TIMEOUT_MS = 300000; // 5 minutes timeout

  async acquire(address: string): Promise<boolean> {
    // Check for timeout on existing lock
    if (this.locked && this.lockTime) {
      const elapsed = Date.now() - this.lockTime;
      if (elapsed > this.TIMEOUT_MS) {
        console.warn(
          `Mutex timeout detected for address: ${address}, forcing release`,
        );
        this.forceRelease();
      }
    }

    if (!this.locked) {
      this.locked = true;
      this.currentAddress = address;
      this.lockTime = Date.now();
      return true;
    }
    // Return false if already locked (no queuing)
    return false;
  }

  release(): void {
    this.locked = false;
    this.currentAddress = null;
    this.lockTime = null;
  }

  forceRelease(): void {
    this.locked = false;
    this.currentAddress = null;
    this.lockTime = null;
  }

  getCurrentAddress(): string | null {
    return this.currentAddress;
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
}
