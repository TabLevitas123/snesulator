import { EventEmitter } from 'events';
import type { PPUState } from '../../types/emulator';
import { TileCache } from './ppu/TileCache';
import { SpriteRenderer } from './ppu/SpriteRenderer';
import { BackgroundRenderer } from './ppu/BackgroundRenderer';
import { Mode7Renderer } from './ppu/Mode7Renderer';
import { Mode7Effects } from './ppu/Mode7Effects';
import { Mode7Background } from './ppu/Mode7Background';
import { ColorMath } from './ppu/ColorMath';
import { WindowLogic } from './ppu/WindowLogic';
import { WindowEffects } from './ppu/WindowEffects';
import { WindowRenderer } from './ppu/WindowRenderer';
import { ModeRenderer } from './ppu/ModeRenderer';
import { RenderPipeline } from './ppu/RenderPipeline';
import { HDMASystem } from './ppu/HDMASystem';
import { Memory } from './Memory';

export class PPU {
  private vram: Uint8Array;
  private oam: Uint8Array;
  private cgram: Uint8Array;
  private events: EventEmitter;
  private tileCache: TileCache;
  private spriteRenderer: SpriteRenderer;
  private backgroundRenderer: BackgroundRenderer;
  private mode7Renderer: Mode7Renderer;
  private mode7Effects: Mode7Effects;
  private mode7Background: Mode7Background;
  private colorMath: ColorMath;
  private windowLogic: WindowLogic;
  private windowEffects: WindowEffects;
  private windowRenderer: WindowRenderer;
  private modeRenderer: ModeRenderer;
  private renderPipeline: RenderPipeline;
  private hdmaSystem: HDMASystem;
  private frameBuffer: ImageData;
  private currentMode: number = 0;
  private scanline: number = 0;

  constructor(memory: Memory) {
    this.vram = new Uint8Array(64 * 1024);  // 64KB VRAM
    this.oam = new Uint8Array(544);         // 544 bytes OAM
    this.cgram = new Uint8Array(512);       // 512 bytes CGRAM
    this.events = new EventEmitter();
    
    // Initialize components
    this.tileCache = new TileCache();
    this.spriteRenderer = new SpriteRenderer(this.oam, this.vram, this.cgram);
    this.backgroundRenderer = new BackgroundRenderer(this.vram, this.cgram);
    this.mode7Renderer = new Mode7Renderer(this);
    this.mode7Effects = new Mode7Effects();
    this.mode7Background = new Mode7Background();
    this.colorMath = new ColorMath();
    this.windowLogic = new WindowLogic();
    this.windowEffects = new WindowEffects();
    this.windowRenderer = new WindowRenderer();
    this.modeRenderer = new ModeRenderer();
    this.renderPipeline = new RenderPipeline(this);
    this.hdmaSystem = new HDMASystem(memory);
    this.frameBuffer = new ImageData(256, 224);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.hdmaSystem.onFrameComplete(() => {
      this.events.emit('frameComplete');
    });
  }

  public writeRegister(address: number, value: number): void {
    // Handle HDMA registers
    if (address >= 0x4300 && address <= 0x437F) {
      this.hdmaSystem.writeRegister(address, value);
      return;
    }

    // Handle other PPU registers
    switch (address) {
      case 0x2100: // Screen display register
        this.setScreenDisplay(value);
        break;
      case 0x2101: // OBJ size and pattern
        this.setObjConfig(value);
        break;
      // Add more register handlers as needed
    }
  }

  public renderScanline(line: number): void {
    this.scanline = line;

    // Start HDMA transfer at the beginning of HBlank
    this.hdmaSystem.startScanline();

    const scanlineBuffer = new Uint32Array(256);
    const mainBuffer = new Uint32Array(256);
    const subBuffer = new Uint32Array(256);

    if (this.isMode7Active()) {
      // Mode 7 rendering
      this.mode7Renderer.renderScanline(line, mainBuffer);
    } else {
      // Normal mode rendering
      this.renderPipeline.renderScanline(line, mainBuffer);
    }

    // Render sprites
    this.spriteRenderer.renderScanline(line, subBuffer);

    // Apply window effects and color math
    this.windowRenderer.renderScanline(line, scanlineBuffer);

    // Copy to frame buffer
    const offset = line * 256 * 4;
    for (let x = 0; x < 256; x++) {
      const color = scanlineBuffer[x];
      const pixelOffset = offset + x * 4;
      this.frameBuffer.data[pixelOffset] = (color >> 16) & 0xFF;     // R
      this.frameBuffer.data[pixelOffset + 1] = (color >> 8) & 0xFF;  // G
      this.frameBuffer.data[pixelOffset + 2] = color & 0xFF;         // B
      this.frameBuffer.data[pixelOffset + 3] = 255;                  // A
    }
  }

  public getState(): PPUState {
    return {
      VRAM: this.vram,
      OAM: this.oam,
      CGRAM: this.cgram
    };
  }

  public isMode7Active(): boolean {
    return this.currentMode === 7;
  }

  public isLayerEnabled(layer: number): boolean {
    return this.modeRenderer.isLayerEnabled(layer);
  }

  public reset(): void {
    this.vram.fill(0);
    this.oam.fill(0);
    this.cgram.fill(0);
    this.currentMode = 0;
    this.scanline = 0;
    
    this.tileCache.clear();
    this.mode7Renderer.reset();
    this.mode7Effects.reset();
    this.mode7Background.reset();
    this.colorMath.reset();
    this.windowLogic.reset();
    this.windowEffects.reset();
    this.windowRenderer.reset();
    this.modeRenderer.reset();
    this.renderPipeline.reset();
    this.hdmaSystem.reset();
  }

  private setScreenDisplay(value: number): void {
    // Implement screen display configuration
  }

  private setObjConfig(value: number): void {
    // Implement OBJ configuration
  }
}