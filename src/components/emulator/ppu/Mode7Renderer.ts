import { PPU } from '../PPU';
import { mat4, vec3 } from 'gl-matrix';

export class Mode7Renderer {
  private matrix: mat4;
  private position: vec3;
  private rotation: vec3;
  private scale: vec3;
  private vram: Uint8Array;
  private cgram: Uint8Array;
  private perspectiveEnabled: boolean;
  private horizonEnabled: boolean;
  private horizonColor: number;

  constructor(private ppu: PPU) {
    this.matrix = mat4.create();
    this.position = vec3.fromValues(0, 0, 0);
    this.rotation = vec3.fromValues(0, 0, 0);
    this.scale = vec3.fromValues(1, 1, 1);
    this.vram = new Uint8Array(0x10000);
    this.cgram = new Uint8Array(0x200);
    this.perspectiveEnabled = false;
    this.horizonEnabled = false;
    this.horizonColor = 0x7ACEFF; // Sky blue
  }

  public setMatrix(a: number, b: number, c: number, d: number, x: number, y: number): void {
    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, [x, y, 0]);
    mat4.scale(this.matrix, this.matrix, [a/256, d/256, 1]);
    mat4.rotateZ(this.matrix, this.matrix, Math.atan2(b, a));
  }

  public setPerspective(enabled: boolean): void {
    this.perspectiveEnabled = enabled;
  }

  public setHorizon(enabled: boolean): void {
    this.horizonEnabled = enabled;
  }

  public setHorizonColor(color: number): void {
    this.horizonColor = color;
  }

  public renderScanline(line: number, output: Uint32Array): void {
    const screenHeight = 224;
    const screenWidth = 256;
    const centerY = screenHeight / 2;
    const centerX = screenWidth / 2;
    
    // Calculate perspective factor for this scanline
    const perspectiveFactor = this.perspectiveEnabled ? 
      Math.max(0.25, 1 - Math.abs(line - centerY) / centerY) : 1;

    for (let x = 0; x < screenWidth; x++) {
      // Apply perspective and calculate transformed coordinates
      const w = (x - centerX) * perspectiveFactor;
      const h = (line - centerY) * perspectiveFactor;

      // Transform point through matrix
      const point = vec3.fromValues(w, h, 0);
      vec3.transformMat4(point, point, this.matrix);

      // Apply horizon effect if enabled
      if (this.horizonEnabled && point[1] < 0) {
        output[x] = this.getHorizonColor(point[1]);
        continue;
      }

      // Get tile and pixel data
      const tileX = Math.floor(point[0]) & 0x3FF;
      const tileY = Math.floor(point[1]) & 0x3FF;
      
      const tileIndex = (tileY >> 3) * 128 + (tileX >> 3);
      const pixelX = tileX & 7;
      const pixelY = tileY & 7;

      const tileData = this.getTileData(tileIndex);
      const colorIndex = this.getPixelColor(tileData, pixelX, pixelY);
      output[x] = this.getCGRAMColor(colorIndex);
    }
  }

  private getTileData(index: number): number {
    return this.vram[index];
  }

  private getPixelColor(tile: number, x: number, y: number): number {
    const offset = tile * 64 + y * 8 + x;
    return this.vram[offset];
  }

  private getCGRAMColor(index: number): number {
    const color = this.cgram[index * 2] | (this.cgram[index * 2 + 1] << 8);
    const r = (color & 0x1F) << 3;
    const g = ((color >> 5) & 0x1F) << 3;
    const b = ((color >> 10) & 0x1F) << 3;
    return (r << 16) | (g << 8) | b;
  }

  private getHorizonColor(height: number): number {
    // Create a gradient effect for the horizon
    const intensity = Math.min(1, Math.abs(height) / 100);
    const baseColor = this.horizonColor;
    const r = ((baseColor >> 16) & 0xFF) * (1 - intensity);
    const g = ((baseColor >> 8) & 0xFF) * (1 - intensity);
    const b = (baseColor & 0xFF) * (1 - intensity);
    return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
  }

  public reset(): void {
    mat4.identity(this.matrix);
    vec3.zero(this.position);
    vec3.zero(this.rotation);
    vec3.set(this.scale, 1, 1, 1);
    this.perspectiveEnabled = false;
    this.horizonEnabled = false;
  }
}