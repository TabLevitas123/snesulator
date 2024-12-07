export class ROMHandler {
  private static readonly VALID_EXTENSIONS = ['.smc', '.sfc'];
  private static readonly MIN_SIZE = 0x8000; // 32KB
  private static readonly MAX_SIZE = 0x800000; // 8MB
  private static readonly HEADER_SIZE = 512;

  public static isValidROMFile(file: File): boolean {
    console.log('Validating ROM file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const isValid = this.VALID_EXTENSIONS.includes(extension);
    
    console.log('ROM file validation result:', {
      extension,
      isValid
    });
    
    return isValid;
  }

  public static async readROMFile(file: File): Promise<ArrayBuffer> {
    console.log('Reading ROM file:', {
      name: file.name,
      size: file.size
    });

    try {
      const buffer = await file.arrayBuffer();
      console.log('ROM file read successfully:', {
        bufferSize: buffer.byteLength,
        hasSMCHeader: buffer.byteLength % 1024 === this.HEADER_SIZE
      });
      
      // Check if file has SMC header
      if (buffer.byteLength % 1024 === this.HEADER_SIZE) {
        console.log('Removing SMC header');
        return buffer.slice(this.HEADER_SIZE);
      }
      
      return buffer;
    } catch (error) {
      console.error('Error reading ROM file:', error);
      throw new Error('Failed to read ROM file');
    }
  }

  public static validateROMSize(buffer: ArrayBuffer): boolean {
    const size = buffer.byteLength;
    console.log('Validating ROM size:', {
      size,
      minSize: this.MIN_SIZE,
      maxSize: this.MAX_SIZE
    });
    
    if (size < this.MIN_SIZE) {
      throw new Error(`ROM file too small (minimum ${this.MIN_SIZE / 1024}KB)`);
    }
    
    if (size > this.MAX_SIZE) {
      throw new Error(`ROM file too large (maximum ${this.MAX_SIZE / 1024 / 1024}MB)`);
    }
    
    if (size % 1024 !== 0) {
      throw new Error('Invalid ROM file size (must be multiple of 1KB)');
    }
    
    console.log('ROM size validation passed');
    return true;
  }

  public static getSuggestedSaveFileName(romName: string): string {
    return romName
      .replace(/\.(smc|sfc)$/i, '')
      .replace(/\s+/g, '_')
      .toLowerCase() + '.sav';
  }
}