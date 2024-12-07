import { ROMValidationError } from './errors';

export class TypeValidator {
  private static readonly VALID_EXTENSIONS = ['.smc', '.sfc'];

  public static validate(fileName: string): void {
    const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    
    console.log('Validating ROM file type:', {
      fileName,
      extension,
      validExtensions: this.VALID_EXTENSIONS
    });

    if (!this.VALID_EXTENSIONS.includes(extension)) {
      throw new ROMValidationError(
        `Invalid file type: ${extension}. ` +
        `Supported formats: ${this.VALID_EXTENSIONS.join(', ')}`
      );
    }

    console.log('ROM file type validation passed');
  }
}