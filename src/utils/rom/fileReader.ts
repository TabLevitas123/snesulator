import { ROMLoadError } from './errors';

export class ROMFileReader {
  private static readonly SMC_HEADER_SIZE = 512;

  public static async read(file: File): Promise<ArrayBuffer> {
    try {
      console.log('Reading ROM file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const buffer = await file.arrayBuffer();
      
      // Check for SMC header
      if (buffer.byteLength % 1024 === this.SMC_HEADER_SIZE) {
        console.log('SMC header detected, removing...');
        return buffer.slice(this.SMC_HEADER_SIZE);
      }
      
      return buffer;
    } catch (error) {
      console.error('Failed to read ROM file:', error);
      throw new ROMLoadError(`Failed to read ROM file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}