import { Memory } from '../Memory';

export class AddressingModes {
  constructor(private memory: Memory) {}

  immediate(pc: number): { address: number; cycles: number } {
    return { address: pc, cycles: 2 };
  }

  absolute(pc: number): { address: number; cycles: number } {
    const low = this.memory.read(pc);
    const high = this.memory.read(pc + 1);
    return { address: (high << 8) | low, cycles: 3 };
  }

  absoluteX(pc: number, x: number): { address: number; cycles: number } {
    const base = this.absolute(pc).address;
    return { address: (base + x) & 0xFFFF, cycles: 4 };
  }

  absoluteY(pc: number, y: number): { address: number; cycles: number } {
    const base = this.absolute(pc).address;
    return { address: (base + y) & 0xFFFF, cycles: 4 };
  }

  indirect(pc: number): { address: number; cycles: number } {
    const pointer = this.absolute(pc).address;
    const low = this.memory.read(pointer);
    const high = this.memory.read(pointer + 1);
    return { address: (high << 8) | low, cycles: 6 };
  }

  relative(pc: number): { address: number; cycles: number } {
    const offset = this.memory.read(pc);
    const address = pc + ((offset & 0x80) ? offset - 256 : offset);
    return { address: address & 0xFFFF, cycles: 2 };
  }
}