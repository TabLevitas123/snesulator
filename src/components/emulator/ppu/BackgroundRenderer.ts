export class BackgroundRenderer {
  private vram: Uint8Array;
  private cgram: Uint8Array;

  constructor(vram: Uint8Array, cgram: Uint8Array) {
    this.vram = vram;
    this.cgram = cgram;
  }

  public renderScanline(line: number, frameBuffer: ImageData): void {
    // Render each background layer
    this.renderBGLayer(0, line, frameBuffer); // Background 1
    this.renderBGLayer(1, line, frameBuffer); // Background 2
    this.renderBGLayer(2, line, frameBuffer); // Background 3
    this.renderBGLayer(3, line, frameBuffer); // Background 4
  }

  private renderBGLayer(layer: number, line: number, frameBuffer: ImageData): void {
    const baseAddr = layer * 0x400; // Each tilemap is 1KB
    const tileDataBaseAddr = layer * 0x1000; // Each tile data block is 4KB

    for (let x = 0; x < 32; x++) { // 32 tiles per line
      const tileIndex = this.vram[baseAddr + (line >> 3) * 32 + x];
      const tileAttr = this.vram[baseAddr + 0x400 + (line >> 3) * 32 + x];
      
      const palette = (tileAttr & 0xE0) >> 5;
      const priority = (tileAttr & 0x20) !== 0;
      const flipX = (tileAttr & 0x40) !== 0;
      const flipY = (tileAttr & 0x80) !== 0;

      this.renderTile(
        tileDataBaseAddr + tileIndex * 32,
        x * 8,
        line,
        palette,
        priority,
        flipX,
        flipY,
        frameBuffer
      );
    }
  }

  private renderTile(
    tileAddr: number,
    x: number,
    y: number,
    palette: number,
    priority: boolean,
    flipX: boolean,
    flipY: boolean,
    frameBuffer: ImageData
  ): void {
    const tileY = y & 7;
    const row = flipY ? 7 - tileY : tileY;

    for (let i = 0; i < 8; i++) {
      const col = flipX ? 7 - i : i;
      const pixelX = x + i;

      // Skip if pixel is off-screen
      if (pixelX < 0 || pixelX >= 256) continue;

      const colorIndex = this.getPixelColor(tileAddr, col, row);
      if (colorIndex === 0) continue; // Transparent pixel

      const color = this.getCGRAMColor(palette * 16 + colorIndex);
      const pixelOffset = (y * 256 + pixelX) * 4;

      // Only draw if this pixel has priority
      if (priority || frameBuffer.data[pixelOffset + 3] === 0) {
        frameBuffer.data[pixelOffset] = (color >> 16) & 0xFF;     // R
        frameBuffer.data[pixelOffset + 1] = (color >> 8) & 0xFF;  // G
        frameBuffer.data[pixelOffset + 2] = color & 0xFF;         // B
        frameBuffer.data[pixelOffset + 3] = 255;                  // A
      }
    }
  }

  private getPixelColor(tileAddr: number, x: number, y: number): number {
    const addr = tileAddr + y * 2;
    const shift = 7 - x;
    
    const low = (this.vram[addr] >> shift) & 1;
    const high = (this.vram[addr + 1] >> shift) & 1;
    
    return (high << 1) | low;
  }

  private getCGRAMColor(index: number): number {
    const color = this.cgram[index * 2] | (this.cgram[index * 2 + 1] << 8);
    const r = (color & 0x1F) << 3;
    const g = ((color >> 5) & 0x1F) << 3;
    const b = ((color >> 10) & 0x1F) << 3;
    return (r << 16) | (g << 8) | b;
  }
}