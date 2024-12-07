export class ModeRenderer {
  private mode: number;
  private layerPriorities: number[];
  private layerEnabled: boolean[];
  private bgCharacterData: Uint32Array[];
  private bgScreenData: Uint32Array[];

  constructor() {
    this.mode = 0;
    this.layerPriorities = [0, 0, 0, 0];
    this.layerEnabled = [false, false, false, false];
    this.bgCharacterData = Array(4).fill(null).map(() => new Uint32Array(0x4000));
    this.bgScreenData = Array(4).fill(null).map(() => new Uint32Array(0x1000));
  }

  public setMode(mode: number): void {
    if (mode >= 0 && mode <= 7) {
      this.mode = mode;
    }
  }

  public setLayerPriority(layer: number, priority: number): void {
    if (layer >= 0 && layer < 4) {
      this.layerPriorities[layer] = priority;
    }
  }

  public enableLayer(layer: number, enabled: boolean): void {
    if (layer >= 0 && layer < 4) {
      this.layerEnabled[layer] = enabled;
    }
  }

  public getLayerInfo(layer: number): {
    bpp: number;
    width: number;
    height: number;
  } {
    switch (this.mode) {
      case 0:
        return { bpp: 2, width: 256, height: 256 };
      case 1:
        return layer < 2 
          ? { bpp: 4, width: 256, height: 256 }
          : { bpp: 2, width: 256, height: 256 };
      case 2:
        return { bpp: 4, width: 256, height: 512 };
      case 3:
        return layer === 0
          ? { bpp: 8, width: 256, height: 256 }
          : { bpp: 4, width: 256, height: 256 };
      case 4:
        return layer === 0
          ? { bpp: 8, width: 256, height: 256 }
          : { bpp: 2, width: 256, height: 256 };
      case 5:
        return layer === 0
          ? { bpp: 4, width: 512, height: 256 }
          : { bpp: 2, width: 512, height: 256 };
      case 6:
        return { bpp: 4, width: 512, height: 512 };
      case 7:
        return { bpp: 8, width: 256, height: 256 };
      default:
        return { bpp: 2, width: 256, height: 256 };
    }
  }

  public writeCharacterData(layer: number, address: number, value: number): void {
    if (layer >= 0 && layer < 4) {
      this.bgCharacterData[layer][address & 0x3FFF] = value;
    }
  }

  public writeScreenData(layer: number, address: number, value: number): void {
    if (layer >= 0 && layer < 4) {
      this.bgScreenData[layer][address & 0xFFF] = value;
    }
  }

  public getLayerPriority(layer: number): number {
    return this.layerPriorities[layer];
  }

  public isLayerEnabled(layer: number): boolean {
    return this.layerEnabled[layer];
  }

  public reset(): void {
    this.mode = 0;
    this.layerPriorities.fill(0);
    this.layerEnabled.fill(false);
    for (const data of this.bgCharacterData) {
      data.fill(0);
    }
    for (const data of this.bgScreenData) {
      data.fill(0);
    }
  }
}