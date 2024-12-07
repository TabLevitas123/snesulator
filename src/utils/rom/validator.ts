import { ROM_CONSTANTS, ERROR_MESSAGES } from './constants';
import { ValidationResult, ChecksumDetails } from './types';
import { ROMValidationError } from './errors';

export class ROMValidator {
  public static validateFileType(fileName: string): void {
    const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    
    console.log('Validating file type:', { fileName, extension });
    
    if (!ROM_CONSTANTS.VALID_EXTENSIONS.includes(extension as any)) {
      throw new ROMValidationError(ERROR_MESSAGES.INVALID_TYPE(extension));
    }
  }

  public static validateSize(size: number): void {
    console.log('Validating size:', { size });

    if (size < ROM_CONSTANTS.MIN_SIZE) {
      throw new ROMValidationError(ERROR_MESSAGES.FILE_TOO_SMALL(size));
    }

    if (size > ROM_CONSTANTS.MAX_SIZE) {
      throw new ROMValidationError(ERROR_MESSAGES.FILE_TOO_LARGE(size));
    }

    if (size % 1024 !== 0) {
      throw new ROMValidationError(ERROR_MESSAGES.INVALID_SIZE);
    }
  }

  public static validateChecksum(data: Uint8Array): ValidationResult {
    try {
      const offset = ROM_CONSTANTS.HEADER_OFFSET;
      const complement = (data[offset + 0x2C] << 8) | data[offset + 0x2D];
      const expected = (data[offset + 0x2E] << 8) | data[offset + 0x2F];

      let calculated = 0;
      for (let i = 0; i < data.length; i++) {
        if (i < offset + 0x2C || i > offset + 0x2F) {
          calculated += data[i];
        }
      }

      calculated &= 0xFFFF;
      
      const details: ChecksumDetails = {
        calculated,
        expected,
        complement
      };

      const isValid = (calculated + complement) === 0xFFFF && 
                     calculated === expected;

      console.log('Checksum validation:', { isValid, ...details });

      return { isValid, details };
    } catch (error) {
      console.error('Checksum validation error:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}