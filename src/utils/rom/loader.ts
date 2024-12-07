import { ROMData } from '../../types/rom';
import { ROMValidationError } from './errors';
import { ROMValidator } from './validator';
import { HeaderParser } from './headerParser';
import { ROM_CONSTANTS } from './constants';
import { LoadProgress } from './types';

export class ROMLoader {
  public static async load(
    file: File,
    onProgress?: (progress: LoadProgress) => void
  ): Promise<ROMData> {
    const startTime = performance.now();
    
    const logProgress = (step: LoadProgress['step'], details?: Record<string, any>) => {
      const progress = {
        step,
        timestamp: performance.now() - startTime,
        details
      };
      console.log(`ROM loading step: ${step}`, progress);
      onProgress?.(progress);
    };

    try {
      // Validate file type
      logProgress('validation');
      ROMValidator.validateFileType(file.name);

      // Read file
      logProgress('reading');
      const buffer = await file.arrayBuffer();
      let data = new Uint8Array(buffer);

      // Handle SMC header if present
      if (buffer.byteLength % 1024 === ROM_CONSTANTS.SMC_HEADER_SIZE) {
        console.log('Removing SMC header');
        data = new Uint8Array(buffer.slice(ROM_CONSTANTS.SMC_HEADER_SIZE));
      }

      // Validate size
      ROMValidator.validateSize(data.length);

      // Parse header
      logProgress('parsing');
      const header = HeaderParser.parse(data);

      // Validate checksum
      logProgress('checksum');
      const { isValid: valid, details } = ROMValidator.validateChecksum(data);

      if (!valid) {
        console.warn('Checksum validation failed:', details);
      }

      const result: ROMData = { header, data, valid };
      
      logProgress('complete');
      return result;
    } catch (error) {
      console.error('ROM load failed:', error);
      throw error instanceof Error ? error : new ROMValidationError('Unknown error during ROM load');
    }
  }
}