export interface HDMAChannelState {
  enabled: boolean;
  mode: number;
  sourceAddress: number;
  sourceBank: number;
  destAddress: number;
  indirectBank: number;
  lineCounter: number;
  terminated: boolean;
  doTransfer: boolean;
}

export class HDMAChannel {
  private state: HDMAChannelState;

  constructor() {
    this.state = {
      enabled: false,
      mode: 0,
      sourceAddress: 0,
      sourceBank: 0,
      destAddress: 0,
      indirectBank: 0,
      lineCounter: 0,
      terminated: false,
      doTransfer: false
    };
  }

  public getState(): HDMAChannelState {
    return { ...this.state };
  }

  public setState(newState: Partial<HDMAChannelState>): void {
    this.state = { ...this.state, ...newState };
  }

  public isEnabled(): boolean {
    return this.state.enabled && !this.state.terminated;
  }

  public shouldTransfer(): boolean {
    return this.state.doTransfer;
  }

  public isIndirectMode(): boolean {
    return (this.state.mode & 0x40) !== 0;
  }

  public getTransferSize(): number {
    const mode = this.state.mode & 0x07;
    switch (mode) {
      case 0: return 1;  // 1 byte
      case 1: return 2;  // 2 bytes
      case 2: return 2;  // 2 bytes, write twice
      case 3: return 4;  // 4 bytes
      case 4: return 4;  // 4 bytes, write twice
      case 5: return 4;  // 4 bytes, write four times
      case 6: return 2;  // 2 bytes, write twice alternating
      case 7: return 4;  // 4 bytes, write twice alternating
      default: return 1;
    }
  }

  public reset(): void {
    this.state = {
      enabled: false,
      mode: 0,
      sourceAddress: 0,
      sourceBank: 0,
      destAddress: 0,
      indirectBank: 0,
      lineCounter: 0,
      terminated: false,
      doTransfer: false
    };
  }
}