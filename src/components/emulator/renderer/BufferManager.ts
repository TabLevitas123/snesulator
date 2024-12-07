export class BufferManager {
  private gl: WebGLRenderingContext;
  private buffers: Map<string, WebGLBuffer>;
  private currentVAO: WebGLVertexArrayObject | null = null;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.buffers = new Map();
  }

  public createBuffer(
    name: string,
    data: Float32Array | Uint16Array,
    target: number = WebGLRenderingContext.ARRAY_BUFFER,
    usage: number = WebGLRenderingContext.STATIC_DRAW
  ): WebGLBuffer {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');

    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, usage);
    this.buffers.set(name, buffer);

    return buffer;
  }

  public updateBuffer(
    name: string,
    data: Float32Array | Uint16Array,
    target: number = WebGLRenderingContext.ARRAY_BUFFER
  ): void {
    const buffer = this.buffers.get(name);
    if (!buffer) {
      throw new Error(`Buffer '${name}' not found`);
    }

    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, this.gl.STATIC_DRAW);
  }

  public bindBuffer(
    name: string,
    target: number = WebGLRenderingContext.ARRAY_BUFFER
  ): void {
    const buffer = this.buffers.get(name);
    if (!buffer) {
      throw new Error(`Buffer '${name}' not found`);
    }

    this.gl.bindBuffer(target, buffer);
  }

  public setupAttribute(
    program: WebGLProgram,
    attributeName: string,
    size: number,
    type: number = WebGLRenderingContext.FLOAT,
    normalized: boolean = false,
    stride: number = 0,
    offset: number = 0
  ): void {
    const location = this.gl.getAttribLocation(program, attributeName);
    if (location === -1) {
      throw new Error(`Attribute '${attributeName}' not found in shader program`);
    }

    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(
      location,
      size,
      type,
      normalized,
      stride,
      offset
    );
  }

  public deleteBuffer(name: string): void {
    const buffer = this.buffers.get(name);
    if (buffer) {
      this.gl.deleteBuffer(buffer);
      this.buffers.delete(name);
    }
  }

  public clear(): void {
    this.buffers.forEach(buffer => {
      this.gl.deleteBuffer(buffer);
    });
    this.buffers.clear();
  }
}