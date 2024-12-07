import { ROMHeader } from '../../types/rom';
import { ROMValidationError } from './errors';

export class ROMHeaderParser {
  private static readonly HEADER_OFFSET = 0x7FC0;
  private static readonly TITLE_LENGTH = 21;

  public static parse(data: Uint8Array): ROMHeader {
    try {
      const headerOffset = this.HEADER_OFFSET;
      const titleBytes = data.slice(headerOffset, headerOffset + this.TITLE_LENGTH);
      const name = new TextDecoder('ascii').decode(titleBytes).trim();

      const mapMode = data[headerOffset + 0x25];
      const romSizeFlag = data[headerOffset + 0x27];
      const sramSizeFlag = data[headerOffset + 0x28];

      return {
        name,
        type: (mapMode & 0x1) === 0 ? 'LoROM' : 'HiROM',
        size: romSizeFlag > 0 ? 1024 << (romSizeFlag - 7) : 0,
        sramSize: sramSizeFlag > 0 ? 1024 << (sramSizeFlag - 7) : 0,
        country: data[headerOffset + 0x29],
        license: data[headerOffset + 0x2A],
        version: data[headerOffset + 0x2B],
        checksumComplement: (data[headerOffset + 0x2C] << 8) | data[headerOffset + 0x2D],
        checksum: (data[headerOffset + 0x2E] << 8) | data[headerOffset + 0x2F]
      };
    } catch (error) {
      throw new ROMValidationError('Failed to parse ROM header: ' + (error as Error).message);
    }
  }
}