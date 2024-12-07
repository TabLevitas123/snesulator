import { WindowLogic } from './WindowLogic';

export class WindowEffects {
  private windows: WindowLogic[];
  private mainScreenMask: Uint8Array;
  private subScreenMask: Uint8Array;
  private colorMathMask: Uint8Array;
  private windowCombineLogic: number[];

  constructor() {
    // Create two window instances
    this.windows = [new WindowLogic(), new WindowLogic()];
    
    // Create masks for different purposes
    this.mainScreenMask = new Uint8Array(256);
    this.subScreenMask = new Uint8Array(256);
    this.colorMathMask = new Uint8Array(256);
    
    // Window combine logic for each layer (OR, AND, XOR, XNOR)
    this.windowCombineLogic = new Array(6).fill(0); // 4 BG layers + OBJ + ColorMath
  }

  public setWindow(index: number, enabled: boolean, inverted: boolean, left: number, right: number): void {
    if (index >= 0 && index < 2) {
      this.windows[index].setWindow(enabled, inverted, left, right);
    }
  }

  public setCombineLogic(layer: number, logic: number): void {
    if (layer >= 0 && layer < this.windowCombineLogic.length) {
      this.windowCombineLogic[layer] = logic & 0x03;
    }
  }

  public generateMasks(line: number): void {
    // Generate individual window masks
    const window1Mask = new Uint8Array(256);
    const window2Mask = new Uint8Array(256);

    this.windows[0].generateMask(window1Mask);
    this.windows[1].generateMask(window2Mask);

    // Combine window masks based on logic for each layer
    for (let layer = 0; layer < this.windowCombineLogic.length; layer++) {
      const targetMask = layer === 5 ? this.colorMathMask :
                        layer === 4 ? this.subScreenMask :
                        this.mainScreenMask;

      for (let x = 0; x < 256; x++) {
        const w1 = window1Mask[x];
        const w2 = window2Mask[x];

        switch (this.windowCombineLogic[layer]) {
          case 0: // OR
            targetMask[x] = w1 | w2;
            break;
          case 1: // AND
            targetMask[x] = w1 & w2;
            break;
          case 2: // XOR
            targetMask[x] = w1 ^ w2;
            break;
          case 3: // XNOR
            targetMask[x] = ~(w1 ^ w2) & 1;
            break;
        }
      }
    }
  }

  public isMainScreenVisible(x: number): boolean {
    return this.mainScreenMask[x] !== 0;
  }

  public isSubScreenVisible(x: number): boolean {
    return this.subScreenMask[x] !== 0;
  }

  public isColorMathEnabled(x: number): boolean {
    return this.colorMathMask[x] !== 0;
  }

  public reset(): void {
    this.windows.forEach(window => window.reset());
    this.mainScreenMask.fill(0);
    this.subScreenMask.fill(0);
    this.colorMathMask.fill(0);
    this.windowCombineLogic.fill(0);
  }
}