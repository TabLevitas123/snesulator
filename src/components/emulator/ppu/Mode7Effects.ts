import { mat4, vec3 } from 'gl-matrix';

export class Mode7Effects {
  private matrix: mat4;
  private rotation: number;
  private scale: vec3;
  private position: vec3;
  private perspective: boolean;
  private horizonEffect: boolean;
  private horizonStart: number;
  private horizonEnd: number;

  constructor() {
    this.matrix = mat4.create();
    this.rotation = 0;
    this.scale = vec3.fromValues(1, 1, 1);
    this.position = vec3.fromValues(0, 0, 0);
    this.perspective = false;
    this.horizonEffect = false;
    this.horizonStart = 0;
    this.horizonEnd = 128;
  }

  public setRotation(degrees: number): void {
    this.rotation = degrees * Math.PI / 180;
    this.updateMatrix();
  }

  public setScale(x: number, y: number = x): void {
    vec3.set(this.scale, x, y, 1);
    this.updateMatrix();
  }

  public setPosition(x: number, y: number, z: number = 0): void {
    vec3.set(this.position, x, y, z);
    this.updateMatrix();
  }

  public setPerspective(enabled: boolean): void {
    this.perspective = enabled;
  }

  public setHorizonEffect(enabled: boolean, start: number = 0, end: number = 128): void {
    this.horizonEffect = enabled;
    this.horizonStart = start;
    this.horizonEnd = end;
  }

  private updateMatrix(): void {
    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, this.position);
    mat4.rotateZ(this.matrix, this.matrix, this.rotation);
    mat4.scale(this.matrix, this.matrix, this.scale);
  }

  public transformPoint(x: number, y: number): { x: number; y: number; z: number } {
    const point = vec3.fromValues(x, y, 0);
    vec3.transformMat4(point, point, this.matrix);
    
    if (this.perspective) {
      const z = Math.max(0.1, 1 + point[2] / 1000);
      point[0] /= z;
      point[1] /= z;
    }

    if (this.horizonEffect && point[1] < this.horizonStart) {
      const factor = Math.max(0, (point[1] - this.horizonStart) / (this.horizonEnd - this.horizonStart));
      point[1] = this.horizonStart + factor * (point[1] - this.horizonStart);
    }

    return {
      x: point[0],
      y: point[1],
      z: point[2]
    };
  }

  public getTransformationMatrix(): mat4 {
    return this.matrix;
  }

  public reset(): void {
    mat4.identity(this.matrix);
    this.rotation = 0;
    vec3.set(this.scale, 1, 1, 1);
    vec3.set(this.position, 0, 0, 0);
    this.perspective = false;
    this.horizonEffect = false;
    this.horizonStart = 0;
    this.horizonEnd = 128;
  }
}