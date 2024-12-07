import { EventEmitter } from 'events';
import { MemoryMap } from './MemoryMap';

interface HDMAChannel {
  enabled: boolean;
  indirect: boolean;
  sourceBank: number;
  sourceAddress: number;
  destAddress: number;
  lineCount: number;
  tableAddress: number;
  currentLine: number;
  firstTransfer: boolean;
}

export class HDMAController {
  private channels: HDMAChannel[];
  private memoryMap: MemoryMap;
  private events: EventEmitter;
  private active: boolean;

  constructor(memoryMap: MemoryMap) {
    this.memoryMap = memoryMap;
    this.events = new EventEmitter();
    this.channels = Array.from({ length: 8 }, () => ({
      enabled: false,
      indirect: false,
      sourceBank: 0,
      sourceAddress: 0,
      destAddress: 0,
      lineCount: 0,
      tableAddress: 0,
      currentLine: 0,
      firstTransfer: true
    }));
    this.active = false;
  }

  public write(channel: number, register: number, value: number): void {
    if (channel >= 0 && channel < 8) {
      const hdma = this.channels[channel];
      
      switch (register) {
        case 0: // Control
          hdma.enabled = (value & 0x01) !== 0;
          hdma.indirect = (value & 0x40) !== 0;
          break;
        case 1: // Destination Register
          hdma.destAddress = value;
          break;
        case 2: // Source Address Low
          hdma.sourceAddress = (hdma.sourceAddress & 0xFF00) | value;
          break;
        case 3: // Source Address High
          hdma.sourceAddress = (hdma.sourceAddress & 0x00FF) | (value << 8);
          break;
        case 4: // Source Bank
          hdma.sourceBank = value;
          break;
        case 5: // Indirect Bank
          if (hdma.indirect) {
            hdma.tableAddress = value << 16;
          }
          break;
        case 6: // Line Counter
          hdma.lineCount = value;
          hdma.currentLine = 0;
          hdma.firstTransfer = true;
          break;
      }
    }
  }

  public read(channel: number, register: number): number {
    if (channel >= 0 && channel < 8) {
      const hdma = this.channels[channel];
      
      switch (register) {
        case 0: // Control
          return (hdma.enabled ? 0x01 : 0x00) | (hdma.indirect ? 0x40 : 0x00);
        case 1: // Destination Register
          return hdma.destAddress;
        case 2: // Source Address Low
          return hdma.sourceAddress & 0xFF;
        case 3: // Source Address High
          return (hdma.sourceAddress >> 8) & 0xFF;
        case 4: // Source Bank
          return hdma.sourceBank;
        case 5: // Indirect Bank
          return hdma.indirect ? (hdma.tableAddress >> 16) : 0;
        case 6: // Line Counter
          return hdma.lineCount;
      }
    }
    return 0;
  }

  public startHBlank(): void {
    if (!this.active) return;

    for (let i = 0; i < 8; i++) {
      const hdma = this.channels[i];
      if (!hdma.enabled) continue;

      if (hdma.firstTransfer || hdma.currentLine === 0) {
        // Read new line count
        const address = (hdma.sourceBank << 16) | hdma.sourceAddress;
        hdma.lineCount = this.memoryMap.read(address);
        hdma.sourceAddress++;
        hdma.firstTransfer = false;

        if (hdma.lineCount === 0) {
          hdma.enabled = false;
          continue;
        }
      }

      // Perform transfer
      if (hdma.indirect) {
        this.performIndirectTransfer(hdma);
      } else {
        this.performDirectTransfer(hdma);
      }

      // Update line counter
      hdma.currentLine++;
      if (hdma.currentLine >= hdma.lineCount) {
        hdma.currentLine = 0;
      }
    }

    this.events.emit('hdmaComplete');
  }

  private performDirectTransfer(hdma: HDMAChannel): void {
    const sourceAddress = (hdma.sourceBank << 16) | hdma.sourceAddress;
    const value = this.memoryMap.read(sourceAddress);
    this.memoryMap.write(hdma.destAddress, value);
    hdma.sourceAddress++;
  }

  private performIndirectTransfer(hdma: HDMAChannel): void {
    // Read pointer from table
    const tableAddress = (hdma.sourceBank << 16) | hdma.sourceAddress;
    const pointer = this.memoryMap.read(tableAddress) |
                   (this.memoryMap.read(tableAddress + 1) << 8);
    
    // Read actual data using pointer
    const sourceAddress = hdma.tableAddress | pointer;
    const value = this.memoryMap.read(sourceAddress);
    this.memoryMap.write(hdma.destAddress, value);
  }

  public enable(): void {
    this.active = true;
  }

  public disable(): void {
    this.active = false;
  }

  public reset(): void {
    this.active = false;
    this.channels.forEach(hdma => {
      hdma.enabled = false;
      hdma.indirect = false;
      hdma.sourceBank = 0;
      hdma.sourceAddress = 0;
      hdma.destAddress = 0;
      hdma.lineCount = 0;
      hdma.tableAddress = 0;
      hdma.currentLine = 0;
      hdma.firstTransfer = true;
    });
  }

  public onHDMAComplete(callback: () => void): void {
    this.events.on('hdmaComplete', callback);
  }
}