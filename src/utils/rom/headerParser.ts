import { ROMHeader } from '../../types/rom';
import { ROMValidationError } from './errors';

export class HeaderParser {
  private static readonly HEADER_OFFSET = 0x7FC0;
  private static readonly TITLE_LENGTH = 21;

  public static parse(data: Uint8Array): ROMHeader {
    try {
      const offset = this.HEADER_OFFSET;
      
      // Parse title
      const titleBytes = data.slice(offset, offset + this.TITLE_LENGTH);
      const name = new TextDecoder('ascii')
        .decode(titleBytes)
        .replace(/\0/g, '')
        .trim();

      // Parse ROM type
      const mapMode = data[offset + 0x25];
      const type = (mapMode & 0x1) === 0 ? 'LoROM' : 'HiROM';

      // Parse sizes
      const romSizeFlag = data[offset + 0x27];
      const sramSizeFlag = data[offset + 0x28];
      const size = romSizeFlag > 0 ? 1024 << (romSizeFlag - 7) : 0;
      const sramSize = sramSizeFlag > 0 ? 1024 << (sramSizeFlag - 7) : 0;

      const header: ROMHeader = {
        name,
        type,
        size,
        sramSize,
        country: data[offset + 0x29],
        license: data[offset + 0x2A],
        version: data[offset + 0x2B],
        checksumComplement: (data[offset + 0x2C] << 8) | data[offset + 0x2D],
        checksum: (data[offset + 0x2E] << 8) | data[offset + 0x2F]
      };

      console.log('Parsed ROM header:', header);
      return header;
    } catch (error) {
      console.error('Failed to parse ROM header:', error);
      throw new ROMValidationError('Failed to parse ROM header');
    }
  }
}