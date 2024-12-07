import { ROMValidationError } from './errors';

export class SizeValidator {
  private static readonly MIN_SIZE = 0x8000; // 32KB
  private static readonly MAX_SIZE = 0x800000; // 8MB

  public static validate(size: number): void {
    console.log('Validating ROM size:', {
      size,
      min: this.MIN_SIZE,
      max: this.MAX_SIZE
    });

    if (size < this.MIN_SIZE) {
      throw new ROMValidationError(
        `ROM file too small (${(size / 1024).toFixed(1)}KB). ` +
        `Minimum size: ${(this.MIN_SIZE / 1024).toFixed(1)}KB`
      );
    }

    if (size > this.MAX_SIZE) {
      throw new ROMValidationError(
        `ROM file too large (${(size / 1024 / 1024).toFixed(1)}MB). ` +
        `Maximum size: ${(this.MAX_SIZE / 1024 / 1024).toFixed(1)}MB`
      );
    }

    if (size % 1024 !== 0) {
      throw new ROMValidationError(
        'Invalid ROM size. Must be a multiple of 1KB'
      );
    }

    console.log('ROM size validation passed');
  }
}