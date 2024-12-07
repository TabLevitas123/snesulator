export class SpriteRenderer {
  private oam: Uint8Array;
  private vram: Uint8Array;
  private cgram: Uint8Array;

  constructor(oam: Uint8Array, vram: Uint8Array, cgram: Uint8Array) {
    this.oam = oam;
    this.vram = vram;
    this.cgram = cgram;
  }

  public renderScanline(line: number, frameBuffer: ImageData): void {
    const sprites = this.getSpritesOnLine(line);
    
    for (const sprite of sprites) {
      this.renderSprite(sprite, line, frameBuffer);
    }
  }

  private getSpritesOnLine(line: number): Array<{
    x: number;
    y: number;
    tile: number;
    attr: number;
  }> {
    const sprites = [];

    // Each sprite uses 4 bytes in OAM
    for (let i = 0; i < 128; i++) {
      const baseAddr = i * 4;
      const y = this.oam[baseAddr];
      const x = this.oam[baseAddr + 1];
      const tile = this.oam[baseAddr + 2];
      const attr = this.oam[baseAddr + 3];

      // Check if sprite is on this scanline
      if (line >= y && line < y + 8) {
        sprites.push({ x, y, tile, attr });
      }
    }

    return sprites.sort((a, b) => b.x - a.x); // Sort by x-coordinate for priority
  }

  private renderSprite(
    sprite: { x: number; y: number; tile: number; attr: number },
    line: number,
    frameBuffer: ImageData
  ): void {
    const tileAddr = sprite.tile * 32;
    const palette = (sprite.attr & 0xF) * 16;
    const flipX = (sprite.attr & 0x40) !== 0;
    const flipY = (sprite.attr & 0x80) !== 0;

    const y = line - sprite.y;
    const tileY = flipY ? 7 - y : y;

    for (let x = 0; x < 8; x++) {
      const tileX = flipX ? 7 - x : x;
      const pixelOffset = ((line * 256) + (sprite.x + x)) * 4;

      // Skip if pixel is off-screen
      if (sprite.x + x < 0 || sprite.x + x >= 256) continue;

      // Get pixel color from VRAM
      const colorIndex = this.getPixelColor(tileAddr, tileX, tileY);
      if (colorIndex === 0) continue; // Transparent pixel

      // Get actual color from CGRAM
      const color = this.getCGRAMColor(palette + colorIndex);

      // Write to frame buffer
      frameBuffer.data[pixelOffset] = (color >> 16) & 0xFF;     // R
      frameBuffer.data[pixelOffset + 1] = (color >> 8) & 0xFF;  // G
      frameBuffer.data[pixelOffset + 2] = color & 0xFF;         // B
      frameBuffer.data[pixelOffset + 3] = 255;                  // A
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