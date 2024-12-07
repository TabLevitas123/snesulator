import { WindowEffects } from './WindowEffects';
import { ColorMath } from './ColorMath';

export class WindowRenderer {
  private windowEffects: WindowEffects;
  private colorMath: ColorMath;
  private mainBuffer: Uint32Array;
  private subBuffer: Uint32Array;

  constructor() {
    this.windowEffects = new WindowEffects();
    this.colorMath = new ColorMath();
    this.mainBuffer = new Uint32Array(256);
    this.subBuffer = new Uint32Array(256);
  }

  public renderScanline(line: number, output: Uint32Array): void {
    // Generate window masks for this scanline
    this.windowEffects.generateMasks(line);

    // Process each pixel
    for (let x = 0; x < 256; x++) {
      let finalColor: number;

      if (this.windowEffects.isMainScreenVisible(x)) {
        finalColor = this.mainBuffer[x];

        if (this.windowEffects.isColorMathEnabled(x) && 
            this.windowEffects.isSubScreenVisible(x)) {
          // Apply color math between main and sub screen
          const mainColor = this.mainBuffer[x];
          const subColor = this.subBuffer[x];
          finalColor = this.colorMath.blendColors(mainColor, subColor);
        }
      } else if (this.windowEffects.isSubScreenVisible(x)) {
        finalColor = this.subBuffer[x];
      } else {
        finalColor = 0; // Transparent/backdrop color
      }

      output[x] = finalColor;
    }
  }

  public setMainScreenPixel(x: number, color: number): void {
    this.mainBuffer[x] = color;
  }

  public setSubScreenPixel(x: number, color: number): void {
    this.subBuffer[x] = color;
  }

  public setWindow(index: number, enabled: boolean, inverted: boolean, left: number, right: number): void {
    this.windowEffects.setWindow(index, enabled, inverted, left, right);
  }

  public setWindowCombineLogic(layer: number, logic: number): void {
    this.windowEffects.setCombineLogic(layer, logic);
  }

  public reset(): void {
    this.windowEffects.reset();
    this.colorMath.reset();
    this.mainBuffer.fill(0);
    this.subBuffer.fill(0);
  }
}