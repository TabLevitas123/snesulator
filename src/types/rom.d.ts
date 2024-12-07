export interface ROMHeader {
  name: string;
  type: 'LoROM' | 'HiROM';
  size: number;
  sramSize: number;
  country: number;
  license: number;
  version: number;
  checksumComplement: number;
  checksum: number;
}

export interface ROMData {
  header: ROMHeader;
  data: Uint8Array;
  valid: boolean;
}