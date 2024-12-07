import { ROMValidationError } from './errors';

export class ROMValidator {
  private static readonly MIN_SIZE = 0x8000; // 32KB
  private static readonly MAX_SIZE = 0x800000; // 8MB
  private static readonly VALID_EXTENSIONS = ['.smc', '.sfc'];

  public static validateFileType(fileName: string): void {
    const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    if (!this.VALID_EXTENSIONS.includes(extension)) {
      throw new ROMValidationError(`Invalid file type: ${extension}. Supported formats: ${this.VALID_EXTENSIONS.join(', ')}`);
    }
  }

  public static validateSize(size: number): void {
    if (size < this.MIN_SIZE) {
      throw new ROMValidationError(`ROM file too small (minimum ${this.MIN_SIZE / 1024}KB)`);
    }
    if (size > this.MAX_SIZE) {
      throw new ROMValidationError(`ROM file too large (maximum ${this.MAX_SIZE / 1024 / 1024}MB)`);
    }
    if (size % 1024 !== 0) {
      throw new ROMValidationError('Invalid ROM size (must be multiple of 1KB)');
    }
  }

  public static validateChecksum(data: Uint8Array): boolean {
    try {
      const headerOffset = 0x7FC0;
      const complement = (data[headerOffset + 0x2C] << 8) | data[headerOffset + 0x2D];
      const expectedChecksum = (data[headerOffset + 0x2E] << 8) | data[headerOffset + 0x2F];

      let checksum = 0;
      for (let i = 0; i < data.length; i++) {
        if (i < headerOffset + 0x2C || i > headerOffset + 0x2F) {
          checksum += data[i];
        }
      }

      checksum &= 0xFFFF;
      return (checksum + complement) === 0xFFFF && checksum === expectedChecksum;
    } catch (error) {
      console.error('Checksum validation error:', error);
      return false;
    }
  }
}