export class ColorMath {
  private mainScreen: Uint32Array;
  private subScreen: Uint32Array;
  private windowMask: Uint8Array;
  private colorMathEnabled: boolean;
  private addSubscreen: boolean;
  private halfColor: boolean;
  private clipToBlack: boolean;
  private preventOverflow: boolean;
  private fixedColor: number;

  constructor() {
    this.mainScreen = new Uint32Array(256);
    this.subScreen = new Uint32Array(256);
    this.windowMask = new Uint8Array(256);
    this.colorMathEnabled = false;
    this.addSubscreen = false;
    this.halfColor = false;
    this.clipToBlack = false;
    this.preventOverflow = false;
    this.fixedColor = 0;
  }

  public setColorMathConfig(config: {
    enabled: boolean;
    addSubscreen: boolean;
    halfColor: boolean;
    clipToBlack: boolean;
    preventOverflow: boolean;
  }): void {
    this.colorMathEnabled = config.enabled;
    this.addSubscreen = config.addSubscreen;
    this.halfColor = config.halfColor;
    this.clipToBlack = config.clipToBlack;
    this.preventOverflow = config.preventOverflow;
  }

  public setFixedColor(r: number, g: number, b: number): void {
    this.fixedColor = (r << 16) | (g << 8) | b;
  }

  public blendColors(mainColor: number, subColor: number): number {
    if (!this.colorMathEnabled) return mainColor;

    const mainR = (mainColor >> 16) & 0xFF;
    const mainG = (mainColor >> 8) & 0xFF;
    const mainB = mainColor & 0xFF;

    const subR = (subColor >> 16) & 0xFF;
    const subG = (subColor >> 8) & 0xFF;
    const subB = subColor & 0xFF;

    let r: number, g: number, b: number;

    if (this.addSubscreen) {
      r = mainR + subR;
      g = mainG + subG;
      b = mainB + subB;

      if (this.preventOverflow) {
        r = Math.min(r, 255);
        g = Math.min(g, 255);
        b = Math.min(b, 255);
      } else {
        r &= 0xFF;
        g &= 0xFF;
        b &= 0xFF;
      }
    } else {
      r = mainR - subR;
      g = mainG - subG;
      b = mainB - subB;

      if (this.clipToBlack) {
        r = Math.max(r, 0);
        g = Math.max(g, 0);
        b = Math.max(b, 0);
      } else {
        r &= 0xFF;
        g &= 0xFF;
        b &= 0xFF;
      }
    }

    if (this.halfColor) {
      r >>= 1;
      g >>= 1;
      b >>= 1;
    }

    return (r << 16) | (g << 8) | b;
  }

  public processScanline(line: number, output: Uint32Array): void {
    if (!this.colorMathEnabled) {
      output.set(this.mainScreen);
      return;
    }

    for (let x = 0; x < 256; x++) {
      if (!this.windowMask[x]) {
        const mainColor = this.mainScreen[x];
        const subColor = this.subScreen[x] || this.fixedColor;
        output[x] = this.blendColors(mainColor, subColor);
      } else {
        output[x] = this.mainScreen[x];
      }
    }
  }

  public setMainScreenPixel(x: number, color: number): void {
    this.mainScreen[x] = color;
  }

  public setSubScreenPixel(x: number, color: number): void {
    this.subScreen[x] = color;
  }

  public setWindowMask(x: number, mask: boolean): void {
    this.windowMask[x] = mask ? 1 : 0;
  }

  public reset(): void {
    this.mainScreen.fill(0);
    this.subScreen.fill(0);
    this.windowMask.fill(0);
    this.colorMathEnabled = false;
    this.addSubscreen = false;
    this.halfColor = false;
    this.clipToBlack = false;
    this.preventOverflow = false;
    this.fixedColor = 0;
  }
}