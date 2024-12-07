import { ColorMath } from './ColorMath';

export class ColorMathController {
  private colorMath: ColorMath;
  private registers: Uint8Array;

  constructor() {
    this.colorMath = new ColorMath();
    this.registers = new Uint8Array(8); // Color math registers
  }

  public writeRegister(address: number, value: number): void {
    this.registers[address] = value;
    this.updateColorMathConfig();
  }

  public readRegister(address: number): number {
    return this.registers[address];
  }

  private updateColorMathConfig(): void {
    const config = {
      enabled: (this.registers[0] & 0x01) !== 0,
      addSubscreen: (this.registers[0] & 0x02) !== 0,
      halfColor: (this.registers[0] & 0x04) !== 0,
      clipToBlack: (this.registers[0] & 0x08) !== 0,
      preventOverflow: (this.registers[0] & 0x10) !== 0,
    };

    this.colorMath.setColorMathConfig(config);

    // Set fixed color for color math
    const r = this.registers[1] & 0x1F;
    const g = this.registers[2] & 0x1F;
    const b = this.registers[3] & 0x1F;
    this.colorMath.setFixedColor(r << 3, g << 3, b << 3);
  }

  public getColorMath(): ColorMath {
    return this.colorMath;
  }

  public reset(): void {
    this.registers.fill(0);
    this.colorMath.reset();
  }
}