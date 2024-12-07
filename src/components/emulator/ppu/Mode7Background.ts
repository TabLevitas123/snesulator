import { mat4, vec3 } from 'gl-matrix';

export class Mode7Background {
  private matrix: mat4;
  private position: vec3;
  private tileMap: Uint8Array;
  private tileData: Uint8Array;
  private scrollX: number;
  private scrollY: number;
  private repeatMap: boolean;
  private fillOutside: boolean;
  private outsideColor: number;

  constructor() {
    this.matrix = mat4.create();
    this.position = vec3.create();
    this.tileMap = new Uint8Array(128 * 128);
    this.tileData = new Uint8Array(256 * 256);
    this.scrollX = 0;
    this.scrollY = 0;
    this.repeatMap = true;
    this.fillOutside = false;
    this.outsideColor = 0;
  }

  public setTransform(matrix: mat4): void {
    mat4.copy(this.matrix, matrix);
  }

  public setScroll(x: number, y: number): void {
    this.scrollX = x & 0x3FF;
    this.scrollY = y & 0x3FF;
  }

  public setMapRepeat(repeat: boolean): void {
    this.repeatMap = repeat;
  }

  public setOutsideFill(fill: boolean, color: number): void {
    this.fillOutside = fill;
    this.outsideColor = color & 0xFF;
  }

  public getPixel(x: number, y: number): number {
    // Transform point through matrix
    const point = vec3.fromValues(x, y, 0);
    vec3.transformMat4(point, point, this.matrix);

    // Apply scrolling
    const mapX = Math.floor(point[0] + this.scrollX);
    const mapY = Math.floor(point[1] + this.scrollY);

    if (!this.repeatMap) {
      if (mapX < 0 || mapX >= 1024 || mapY < 0 || mapY >= 1024) {
        return this.fillOutside ? this.outsideColor : 0;
      }
    }

    // Wrap coordinates if map repeats
    const wrappedX = this.repeatMap ? mapX & 0x3FF : mapX;
    const wrappedY = this.repeatMap ? mapY & 0x3FF : mapY;

    // Get tile coordinates
    const tileX = wrappedX >> 3;
    const tileY = wrappedY >> 3;
    const pixelX = wrappedX & 7;
    const pixelY = wrappedY & 7;

    // Get tile number from map
    const tileNumber = this.tileMap[tileY * 128 + tileX];

    // Get pixel from tile data
    const tileOffset = tileNumber * 64; // 8x8 pixels
    return this.tileData[tileOffset + pixelY * 8 + pixelX];
  }

  public writeTileMap(address: number, value: number): void {
    if (address < this.tileMap.length) {
      this.tileMap[address] = value;
    }
  }

  public writeTileData(address: number, value: number): void {
    if (address < this.tileData.length) {
      this.tileData[address] = value;
    }
  }

  public reset(): void {
    mat4.identity(this.matrix);
    vec3.zero(this.position);
    this.tileMap.fill(0);
    this.tileData.fill(0);
    this.scrollX = 0;
    this.scrollY = 0;
    this.repeatMap = true;
    this.fillOutside = false;
    this.outsideColor = 0;
  }
}