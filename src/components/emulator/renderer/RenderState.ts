import { mat4 } from 'gl-matrix';

export interface RenderState {
  brightness: number;
  contrast: number;
  saturation: number;
  matrix: mat4;
  textureMatrix: mat4;
}

export class RenderStateManager {
  private state: RenderState;

  constructor() {
    this.state = {
      brightness: 1.0,
      contrast: 1.0,
      saturation: 1.0,
      matrix: mat4.create(),
      textureMatrix: mat4.create()
    };
  }

  public setState(newState: Partial<RenderState>): void {
    this.state = { ...this.state, ...newState };
  }

  public getState(): RenderState {
    return { ...this.state };
  }

  public setBrightness(value: number): void {
    this.state.brightness = Math.max(0, Math.min(2, value));
  }

  public setContrast(value: number): void {
    this.state.contrast = Math.max(0, Math.min(2, value));
  }

  public setSaturation(value: number): void {
    this.state.saturation = Math.max(0, Math.min(2, value));
  }

  public setMatrix(matrix: mat4): void {
    mat4.copy(this.state.matrix, matrix);
  }

  public setTextureMatrix(matrix: mat4): void {
    mat4.copy(this.state.textureMatrix, matrix);
  }

  public reset(): void {
    this.state.brightness = 1.0;
    this.state.contrast = 1.0;
    this.state.saturation = 1.0;
    mat4.identity(this.state.matrix);
    mat4.identity(this.state.textureMatrix);
  }
}