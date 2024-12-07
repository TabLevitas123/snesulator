import type { CPU } from '../CPU';

export interface Instruction {
  opcode: number;
  name: string;
  mode: AddressingMode;
  cycles: number;
  execute: (cpu: CPU) => void;
}

export enum AddressingMode {
  Implied,
  Immediate,
  Absolute,
  AbsoluteX,
  AbsoluteY,
  Indirect,
  IndirectX,
  IndirectY,
  Relative,
}

// Initial set of instructions
export const instructions: Instruction[] = [
  {
    opcode: 0xEA,
    name: 'NOP',
    mode: AddressingMode.Implied,
    cycles: 2,
    execute: () => {
      // No operation
    },
  },
  // More instructions will be added
];