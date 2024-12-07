import { PPU } from '../PPU';
import { TileCache } from './TileCache';
import { SpriteRenderer } from './SpriteRenderer';
import { BackgroundRenderer } from './BackgroundRenderer';

export class RenderPipeline {
  private ppu: PPU;
  private tileCache: TileCache;
  private spriteRenderer: SpriteRenderer;
  private backgroundRenderer: BackgroundRenderer;
  private frameBuffer: ImageData;
  private scanlineBuffer: Uint32Array;

  constructor(ppu: PPU) {
    this.ppu = ppu;
    this.tileCache = new TileCache();
    this.spriteRenderer = new SpriteRenderer(ppu);
    this.backgroundRenderer = new BackgroundRenderer(ppu, this.tileCache);
    this.frameBuffer = new ImageData(256, 224);
    this.scanlineBuffer = new Uint32Array(256);
  }

  public renderFrame(): ImageData {
    // Clear frame buffer
    this.frameBuffer.data.fill(0);

    // Render each scanline
    for (let line = 0; line < 224; line++) {
      this.renderScanline(line);
    }

    return this.frameBuffer;
  }

  private renderScanline(line: number): void {
    // Clear scanline buffer
    this.scanlineBuffer.fill(0);

    // Render background layers
    for (let layer = 0; layer < 4; layer++) {
      if (this.ppu.isLayerEnabled(layer)) {
        this.backgroundRenderer.renderScanline(layer, line, this.scanlineBuffer);
      }
    }

    // Render sprites
    if (this.ppu.isSpritesEnabled()) {
      this.spriteRenderer.renderScanline(line, this.scanlineBuffer);
    }

    // Copy scanline buffer to frame buffer
    const offset = line * 256 * 4;
    for (let x = 0; x < 256; x++) {
      const color = this.scanlineBuffer[x];
      const pixelOffset = offset + x * 4;
      this.frameBuffer.data[pixelOffset] = (color >> 16) & 0xFF;     // R
      this.frameBuffer.data[pixelOffset + 1] = (color >> 8) & 0xFF;  // G
      this.frameBuffer.data[pixelOffset + 2] = color & 0xFF;         // B
      this.frameBuffer.data[pixelOffset + 3] = 255;                  // A
    }
  }

  public reset(): void {
    this.tileCache.clear();
    this.frameBuffer.data.fill(0);
    this.scanlineBuffer.fill(0);
  }
}