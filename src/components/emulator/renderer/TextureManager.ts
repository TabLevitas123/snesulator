export class TextureManager {
  private gl: WebGLRenderingContext;
  private textures: Map<string, WebGLTexture>;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.textures = new Map();
  }

  public createTexture(
    name: string,
    width: number,
    height: number,
    data?: Uint8Array
  ): WebGLTexture {
    const texture = this.gl.createTexture();
    if (!texture) throw new Error('Failed to create texture');

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );

    if (data) {
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        width,
        height,
        0,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        data
      );
    }

    this.textures.set(name, texture);
    return texture;
  }

  public updateTexture(
    name: string,
    width: number,
    height: number,
    data: Uint8Array
  ): void {
    const texture = this.textures.get(name);
    if (!texture) {
      throw new Error(`Texture '${name}' not found`);
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      width,
      height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      data
    );
  }

  public bindTexture(name: string, unit: number = 0): void {
    const texture = this.textures.get(name);
    if (!texture) {
      throw new Error(`Texture '${name}' not found`);
    }

    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  }

  public deleteTexture(name: string): void {
    const texture = this.textures.get(name);
    if (texture) {
      this.gl.deleteTexture(texture);
      this.textures.delete(name);
    }
  }

  public clear(): void {
    this.textures.forEach(texture => {
      this.gl.deleteTexture(texture);
    });
    this.textures.clear();
  }
}