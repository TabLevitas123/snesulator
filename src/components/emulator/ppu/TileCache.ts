interface CachedTile {
  data: Uint8Array;
  timestamp: number;
}

export class TileCache {
  private cache: Map<number, CachedTile>;
  private currentTimestamp: number;

  constructor() {
    this.cache = new Map();
    this.currentTimestamp = 0;
  }

  public getTile(tileAddress: number, vram: Uint8Array): Uint8Array {
    const cached = this.cache.get(tileAddress);
    
    if (cached) {
      cached.timestamp = ++this.currentTimestamp;
      return cached.data;
    }

    const tileData = this.decodeTile(tileAddress, vram);
    this.cache.set(tileAddress, {
      data: tileData,
      timestamp: ++this.currentTimestamp
    });

    // Clear old entries if cache gets too large
    if (this.cache.size > 1024) {
      this.pruneCache();
    }

    return tileData;
  }

  private decodeTile(address: number, vram: Uint8Array): Uint8Array {
    const tileData = new Uint8Array(64); // 8x8 tile
    
    // SNES 4bpp tile format decoding
    for (let y = 0; y < 8; y++) {
      const plane0 = vram[address + y];
      const plane1 = vram[address + y + 8];
      const plane2 = vram[address + y + 16];
      const plane3 = vram[address + y + 24];

      for (let x = 0; x < 8; x++) {
        const mask = 1 << (7 - x);
        const pixel = ((plane0 & mask) ? 1 : 0) |
                     ((plane1 & mask) ? 2 : 0) |
                     ((plane2 & mask) ? 4 : 0) |
                     ((plane3 & mask) ? 8 : 0);
        tileData[y * 8 + x] = pixel;
      }
    }

    return tileData;
  }

  public invalidate(address: number): void {
    // Invalidate any tiles that use this VRAM address
    for (const [tileAddr] of this.cache) {
      if (tileAddr <= address && address < tileAddr + 32) {
        this.cache.delete(tileAddr);
      }
    }
  }

  private pruneCache(): void {
    // Remove oldest 25% of entries
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const removeCount = Math.floor(entries.length * 0.25);
    for (let i = 0; i < removeCount; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  public clear(): void {
    this.cache.clear();
    this.currentTimestamp = 0;
  }
}