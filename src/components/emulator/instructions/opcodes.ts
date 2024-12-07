import { AddressingMode } from './index';

export interface OpcodeDefinition {
  opcode: number;
  name: string;
  mode: AddressingMode;
  cycles: number;
}

// 65C816 Opcode Map
export const opcodeMap: OpcodeDefinition[] = [
  // Arithmetic Operations
  { opcode: 0x69, name: 'ADC', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0x65, name: 'ADC', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0x6D, name: 'ADC', mode: AddressingMode.Absolute, cycles: 4 },
  { opcode: 0x7D, name: 'ADC', mode: AddressingMode.AbsoluteX, cycles: 4 },
  { opcode: 0x79, name: 'ADC', mode: AddressingMode.AbsoluteY, cycles: 4 },
  { opcode: 0xE9, name: 'SBC', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0xE5, name: 'SBC', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0xED, name: 'SBC', mode: AddressingMode.Absolute, cycles: 4 },

  // Logical Operations
  { opcode: 0x29, name: 'AND', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0x25, name: 'AND', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0x2D, name: 'AND', mode: AddressingMode.Absolute, cycles: 4 },
  { opcode: 0x49, name: 'EOR', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0x45, name: 'EOR', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0x4D, name: 'EOR', mode: AddressingMode.Absolute, cycles: 4 },
  { opcode: 0x09, name: 'ORA', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0x05, name: 'ORA', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0x0D, name: 'ORA', mode: AddressingMode.Absolute, cycles: 4 },

  // Shift & Rotate Operations
  { opcode: 0x0A, name: 'ASL', mode: AddressingMode.Accumulator, cycles: 2 },
  { opcode: 0x06, name: 'ASL', mode: AddressingMode.Direct, cycles: 5 },
  { opcode: 0x0E, name: 'ASL', mode: AddressingMode.Absolute, cycles: 6 },
  { opcode: 0x4A, name: 'LSR', mode: AddressingMode.Accumulator, cycles: 2 },
  { opcode: 0x46, name: 'LSR', mode: AddressingMode.Direct, cycles: 5 },
  { opcode: 0x4E, name: 'LSR', mode: AddressingMode.Absolute, cycles: 6 },
  { opcode: 0x2A, name: 'ROL', mode: AddressingMode.Accumulator, cycles: 2 },
  { opcode: 0x26, name: 'ROL', mode: AddressingMode.Direct, cycles: 5 },
  { opcode: 0x2E, name: 'ROL', mode: AddressingMode.Absolute, cycles: 6 },
  { opcode: 0x6A, name: 'ROR', mode: AddressingMode.Accumulator, cycles: 2 },
  { opcode: 0x66, name: 'ROR', mode: AddressingMode.Direct, cycles: 5 },
  { opcode: 0x6E, name: 'ROR', mode: AddressingMode.Absolute, cycles: 6 },

  // Branch Operations
  { opcode: 0x90, name: 'BCC', mode: AddressingMode.Relative, cycles: 2 },
  { opcode: 0xB0, name: 'BCS', mode: AddressingMode.Relative, cycles: 2 },
  { opcode: 0xF0, name: 'BEQ', mode: AddressingMode.Relative, cycles: 2 },
  { opcode: 0x30, name: 'BMI', mode: AddressingMode.Relative, cycles: 2 },
  { opcode: 0xD0, name: 'BNE', mode: AddressingMode.Relative, cycles: 2 },
  { opcode: 0x10, name: 'BPL', mode: AddressingMode.Relative, cycles: 2 },
  { opcode: 0x50, name: 'BVC', mode: AddressingMode.Relative, cycles: 2 },
  { opcode: 0x70, name: 'BVS', mode: AddressingMode.Relative, cycles: 2 },

  // Jump & Call Operations
  { opcode: 0x4C, name: 'JMP', mode: AddressingMode.Absolute, cycles: 3 },
  { opcode: 0x6C, name: 'JMP', mode: AddressingMode.Indirect, cycles: 5 },
  { opcode: 0x20, name: 'JSR', mode: AddressingMode.Absolute, cycles: 6 },
  { opcode: 0x60, name: 'RTS', mode: AddressingMode.Implied, cycles: 6 },

  // Register Operations
  { opcode: 0xAA, name: 'TAX', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0x8A, name: 'TXA', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0xA8, name: 'TAY', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0x98, name: 'TYA', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0xBA, name: 'TSX', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0x9A, name: 'TXS', mode: AddressingMode.Implied, cycles: 2 },

  // Load/Store Operations
  { opcode: 0xA9, name: 'LDA', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0xA5, name: 'LDA', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0xAD, name: 'LDA', mode: AddressingMode.Absolute, cycles: 4 },
  { opcode: 0xA2, name: 'LDX', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0xA6, name: 'LDX', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0xAE, name: 'LDX', mode: AddressingMode.Absolute, cycles: 4 },
  { opcode: 0xA0, name: 'LDY', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0xA4, name: 'LDY', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0xAC, name: 'LDY', mode: AddressingMode.Absolute, cycles: 4 },

  // Stack Operations
  { opcode: 0x48, name: 'PHA', mode: AddressingMode.Implied, cycles: 3 },
  { opcode: 0x68, name: 'PLA', mode: AddressingMode.Implied, cycles: 4 },
  { opcode: 0x08, name: 'PHP', mode: AddressingMode.Implied, cycles: 3 },
  { opcode: 0x28, name: 'PLP', mode: AddressingMode.Implied, cycles: 4 },

  // Flag Operations
  { opcode: 0x18, name: 'CLC', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0x38, name: 'SEC', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0x58, name: 'CLI', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0x78, name: 'SEI', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0xB8, name: 'CLV', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0xD8, name: 'CLD', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0xF8, name: 'SED', mode: AddressingMode.Implied, cycles: 2 },

  // Compare Operations
  { opcode: 0xC9, name: 'CMP', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0xC5, name: 'CMP', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0xCD, name: 'CMP', mode: AddressingMode.Absolute, cycles: 4 },
  { opcode: 0xE0, name: 'CPX', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0xE4, name: 'CPX', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0xEC, name: 'CPX', mode: AddressingMode.Absolute, cycles: 4 },
  { opcode: 0xC0, name: 'CPY', mode: AddressingMode.Immediate, cycles: 2 },
  { opcode: 0xC4, name: 'CPY', mode: AddressingMode.Direct, cycles: 3 },
  { opcode: 0xCC, name: 'CPY', mode: AddressingMode.Absolute, cycles: 4 },

  // Increment/Decrement Operations
  { opcode: 0xE8, name: 'INX', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0xCA, name: 'DEX', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0xC8, name: 'INY', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0x88, name: 'DEY', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0xE6, name: 'INC', mode: AddressingMode.Direct, cycles: 5 },
  { opcode: 0xEE, name: 'INC', mode: AddressingMode.Absolute, cycles: 6 },
  { opcode: 0xC6, name: 'DEC', mode: AddressingMode.Direct, cycles: 5 },
  { opcode: 0xCE, name: 'DEC', mode: AddressingMode.Absolute, cycles: 6 },

  // System Operations
  { opcode: 0x00, name: 'BRK', mode: AddressingMode.Implied, cycles: 7 },
  { opcode: 0xEA, name: 'NOP', mode: AddressingMode.Implied, cycles: 2 },
  { opcode: 0x40, name: 'RTI', mode: AddressingMode.Implied, cycles: 6 }
];