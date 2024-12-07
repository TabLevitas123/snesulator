import { ROMData, ROMHeader } from '../types/rom';

export class ROMLoader {
  private validateChecksum(data: Uint8Array): boolean {
    try {
      let checksum = 0;
      const headerOffset = 0x7FC0;
      const complement = (data[headerOffset + 0x2C] << 8) | data[headerOffset + 0x2D];
      const checksum_value = (data[headerOffset + 0x2E] << 8) | data[headerOffset + 0x2F];

      console.log('Validating ROM checksum:', {
        complement,
        checksum_value,
        headerOffset
      });

      // Calculate checksum excluding the checksum and complement bytes
      for (let i = 0; i < data.length; i++) {
        if (i < headerOffset + 0x2C || i > headerOffset + 0x2F) {
          checksum += data[i];
        }
      }

      checksum &= 0xFFFF;
      const isValid = (checksum + complement) === 0xFFFF && checksum === checksum_value;
      
      console.log('Checksum validation result:', {
        calculated: checksum,
        expected: checksum_value,
        isValid
      });

      return isValid;
    } catch (error) {
      console.error('Error validating checksum:', error);
      return false;
    }
  }

  private parseHeader(data: Uint8Array): ROMHeader {
    try {
      // SNES ROM header is typically at 0x7FC0-0x7FFF for LoROM
      const headerOffset = 0x7FC0;

      // Read game title (21 bytes)
      const titleBytes = data.slice(headerOffset, headerOffset + 21);
      const decoder = new TextDecoder('ascii');
      const name = decoder.decode(titleBytes).trim();

      // Determine ROM type (LoROM/HiROM)
      const mapMode = data[headerOffset + 0x25];
      const type = (mapMode & 0x1) === 0 ? 'LoROM' : 'HiROM';

      // Get ROM size (banks of 32KB)
      const romSizeFlag = data[headerOffset + 0x27];
      const size = romSizeFlag > 0 ? 1024 << (romSizeFlag - 7) : 0;

      // Get SRAM size (banks of 1KB)
      const sramSizeFlag = data[headerOffset + 0x28];
      const sramSize = sramSizeFlag > 0 ? 1024 << (sramSizeFlag - 7) : 0;

      const header = {
        name,
        type,
        size,
        sramSize,
        country: data[headerOffset + 0x29],
        license: data[headerOffset + 0x2A],
        version: data[headerOffset + 0x2B],
        checksumComplement: (data[headerOffset + 0x2C] << 8) | data[headerOffset + 0x2D],
        checksum: (data[headerOffset + 0x2E] << 8) | data[headerOffset + 0x2F]
      };

      console.log('Parsed ROM header:', header);
      return header;
    } catch (error) {
      console.error('Error parsing ROM header:', error);
      throw new Error('Failed to parse ROM header');
    }
  }

  public async loadROM(file: ArrayBuffer): Promise<ROMData> {
    console.log('Loading ROM file:', { size: file.byteLength });
    
    try {
      const data = new Uint8Array(file);
      
      // Validate minimum ROM size
      if (data.length < 0x8000) {
        throw new Error('Invalid ROM: File is too small');
      }

      const header = this.parseHeader(data);
      const valid = this.validateChecksum(data);

      if (!valid) {
        console.warn('ROM checksum validation failed');
      }

      const romData = {
        header,
        data,
        valid
      };

      console.log('ROM loaded successfully:', {
        name: header.name,
        type: header.type,
        size: header.size,
        valid
      });

      return romData;
    } catch (error) {
      console.error('Failed to load ROM:', error);
      throw error;
    }
  }
}