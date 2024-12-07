export class BankController {
  private banks: Uint8Array[];
  private currentBank: number;
  private bankCount: number;

  constructor(romSize: number) {
    this.bankCount = Math.ceil(romSize / 0x8000); // 32KB banks
    this.banks = Array.from({ length: this.bankCount }, () => new Uint8Array(0x8000));
    this.currentBank = 0;
  }

  public loadROM(data: Uint8Array): void {
    for (let i = 0; i < this.bankCount; i++) {
      const start = i * 0x8000;
      const end = start + 0x8000;
      this.banks[i].set(data.slice(start, end));
    }
  }

  public switchBank(bank: number): void {
    if (bank >= 0 && bank < this.bankCount) {
      this.currentBank = bank;
    } else {
      console.warn(`Invalid bank switch attempt: ${bank}`);
    }
  }

  public read(address: number): number {
    const bankAddress = address & 0x7FFF;
    return this.banks[this.currentBank][bankAddress];
  }

  public getCurrentBank(): number {
    return this.currentBank;
  }

  public getBankCount(): number {
    return this.bankCount;
  }
}