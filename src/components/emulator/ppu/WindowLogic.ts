export class WindowLogic {
  private windows: Array<{
    enabled: boolean;
    invertedMask: boolean;
    left: number;
    right: number;
  }>;

  constructor() {
    this.windows = Array(2).fill(null).map(() => ({
      enabled: false,
      invertedMask: false,
      left: 0,
      right: 0
    }));
  }

  public setWindow(index: number, enabled: boolean, inverted: boolean, left: number, right: number): void {
    if (index < 0 || index > 1) return;

    this.windows[index] = {
      enabled,
      invertedMask: inverted,
      left,
      right
    };
  }

  public getMask(x: number): boolean {
    let inWindow = false;

    for (const window of this.windows) {
      if (!window.enabled) continue;

      const withinBounds = x >= window.left && x <= window.right;
      inWindow = inWindow || (withinBounds !== window.invertedMask);
    }

    return inWindow;
  }

  public generateMask(output: Uint8Array): void {
    for (let x = 0; x < 256; x++) {
      output[x] = this.getMask(x) ? 1 : 0;
    }
  }

  public reset(): void {
    for (const window of this.windows) {
      window.enabled = false;
      window.invertedMask = false;
      window.left = 0;
      window.right = 0;
    }
  }
}