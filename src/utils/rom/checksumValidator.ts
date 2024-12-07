export class ChecksumValidator {
  private static readonly HEADER_OFFSET = 0x7FC0;

  public static validate(data: Uint8Array): {
    isValid: boolean;
    details: {
      calculated: number;
      expected: number;
      complement: number;
    };
  } {
    try {
      const headerOffset = this.HEADER_OFFSET;
      const complement = (data[headerOffset + 0x2C] << 8) | data[headerOffset + 0x2D];
      const expectedChecksum = (data[headerOffset + 0x2E] << 8) | data[headerOffset + 0x2F];

      let calculatedChecksum = 0;
      for (let i = 0; i < data.length; i++) {
        if (i < headerOffset + 0x2C || i > headerOffset + 0x2F) {
          calculatedChecksum += data[i];
        }
      }

      calculatedChecksum &= 0xFFFF;
      const isValid = (calculatedChecksum + complement) === 0xFFFF && 
                     calculatedChecksum === expectedChecksum;

      const details = {
        calculated: calculatedChecksum,
        expected: expectedChecksum,
        complement
      };

      console.log('Checksum validation:', {
        isValid,
        ...details
      });

      return { isValid, details };
    } catch (error) {
      console.error('Checksum validation error:', error);
      return {
        isValid: false,
        details: {
          calculated: 0,
          expected: 0,
          complement: 0
        }
      };
    }
  }
}