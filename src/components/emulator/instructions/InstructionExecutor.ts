import { CPU } from '../CPU';
import { Memory } from '../Memory';
import { AddressingModes } from './addressing';
import { FLAGS } from '../../utils/cpuUtils';
import type { Instruction } from './index';

export class InstructionExecutor {
  private addressingModes: AddressingModes;

  constructor(private cpu: CPU, private memory: Memory) {
    this.addressingModes = new AddressingModes(memory);
  }

  public executeInstruction(instruction: Instruction, state: any): number {
    let cycles = instruction.cycles;

    switch (instruction.name) {
      // Logical Operations
      case 'AND': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        state.A &= this.memory.read(address);
        this.updateZeroAndNegativeFlags(state, state.A);
        cycles += extraCycles;
        break;
      }

      case 'ORA': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        state.A |= this.memory.read(address);
        this.updateZeroAndNegativeFlags(state, state.A);
        cycles += extraCycles;
        break;
      }

      case 'EOR': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        state.A ^= this.memory.read(address);
        this.updateZeroAndNegativeFlags(state, state.A);
        cycles += extraCycles;
        break;
      }

      // Shift Operations
      case 'ASL': {
        if (instruction.mode === AddressingModes.Accumulator) {
          const result = state.A << 1;
          state.P = (state.P & ~FLAGS.CARRY) | (state.A & 0x80 ? FLAGS.CARRY : 0);
          state.A = result & 0xFF;
          this.updateZeroAndNegativeFlags(state, state.A);
        } else {
          const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
          const value = this.memory.read(address);
          const result = value << 1;
          state.P = (state.P & ~FLAGS.CARRY) | (value & 0x80 ? FLAGS.CARRY : 0);
          this.memory.write(address, result & 0xFF);
          this.updateZeroAndNegativeFlags(state, result & 0xFF);
          cycles += extraCycles;
        }
        break;
      }

      case 'LSR': {
        if (instruction.mode === AddressingModes.Accumulator) {
          state.P = (state.P & ~FLAGS.CARRY) | (state.A & 0x01 ? FLAGS.CARRY : 0);
          state.A >>= 1;
          this.updateZeroAndNegativeFlags(state, state.A);
        } else {
          const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
          const value = this.memory.read(address);
          state.P = (state.P & ~FLAGS.CARRY) | (value & 0x01 ? FLAGS.CARRY : 0);
          const result = value >> 1;
          this.memory.write(address, result);
          this.updateZeroAndNegativeFlags(state, result);
          cycles += extraCycles;
        }
        break;
      }

      case 'ROL': {
        const carry = state.P & FLAGS.CARRY ? 1 : 0;
        if (instruction.mode === AddressingModes.Accumulator) {
          const newCarry = state.A & 0x80;
          state.A = ((state.A << 1) | carry) & 0xFF;
          state.P = (state.P & ~FLAGS.CARRY) | (newCarry ? FLAGS.CARRY : 0);
          this.updateZeroAndNegativeFlags(state, state.A);
        } else {
          const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
          const value = this.memory.read(address);
          const newCarry = value & 0x80;
          const result = ((value << 1) | carry) & 0xFF;
          this.memory.write(address, result);
          state.P = (state.P & ~FLAGS.CARRY) | (newCarry ? FLAGS.CARRY : 0);
          this.updateZeroAndNegativeFlags(state, result);
          cycles += extraCycles;
        }
        break;
      }

      case 'ROR': {
        const carry = state.P & FLAGS.CARRY ? 0x80 : 0;
        if (instruction.mode === AddressingModes.Accumulator) {
          const newCarry = state.A & 0x01;
          state.A = (state.A >> 1) | carry;
          state.P = (state.P & ~FLAGS.CARRY) | (newCarry ? FLAGS.CARRY : 0);
          this.updateZeroAndNegativeFlags(state, state.A);
        } else {
          const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
          const value = this.memory.read(address);
          const newCarry = value & 0x01;
          const result = (value >> 1) | carry;
          this.memory.write(address, result);
          state.P = (state.P & ~FLAGS.CARRY) | (newCarry ? FLAGS.CARRY : 0);
          this.updateZeroAndNegativeFlags(state, result);
          cycles += extraCycles;
        }
        break;
      }

      // Load/Store Operations
      case 'LDA': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        state.A = this.memory.read(address);
        this.updateZeroAndNegativeFlags(state, state.A);
        cycles += extraCycles;
        break;
      }

      case 'LDX': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        state.X = this.memory.read(address);
        this.updateZeroAndNegativeFlags(state, state.X);
        cycles += extraCycles;
        break;
      }

      case 'LDY': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        state.Y = this.memory.read(address);
        this.updateZeroAndNegativeFlags(state, state.Y);
        cycles += extraCycles;
        break;
      }

      case 'STA': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        this.memory.write(address, state.A);
        cycles += extraCycles;
        break;
      }

      case 'STX': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        this.memory.write(address, state.X);
        cycles += extraCycles;
        break;
      }

      case 'STY': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        this.memory.write(address, state.Y);
        cycles += extraCycles;
        break;
      }

      // Register Transfer Operations
      case 'TAX': {
        state.X = state.A;
        this.updateZeroAndNegativeFlags(state, state.X);
        break;
      }

      case 'TAY': {
        state.Y = state.A;
        this.updateZeroAndNegativeFlags(state, state.Y);
        break;
      }

      case 'TXA': {
        state.A = state.X;
        this.updateZeroAndNegativeFlags(state, state.A);
        break;
      }

      case 'TYA': {
        state.A = state.Y;
        this.updateZeroAndNegativeFlags(state, state.A);
        break;
      }

      // Stack Operations
      case 'TSX': {
        state.X = state.SP;
        this.updateZeroAndNegativeFlags(state, state.X);
        break;
      }

      case 'TXS': {
        state.SP = state.X;
        break;
      }

      // Flag Operations
      case 'CLC': {
        state.P &= ~FLAGS.CARRY;
        break;
      }

      case 'SEC': {
        state.P |= FLAGS.CARRY;
        break;
      }

      case 'CLI': {
        state.P &= ~FLAGS.IRQ_DISABLE;
        break;
      }

      case 'SEI': {
        state.P |= FLAGS.IRQ_DISABLE;
        break;
      }

      case 'CLV': {
        state.P &= ~FLAGS.OVERFLOW;
        break;
      }

      case 'CLD': {
        state.P &= ~FLAGS.DECIMAL;
        break;
      }

      case 'SED': {
        state.P |= FLAGS.DECIMAL;
        break;
      }

      // Compare Operations
      case 'CMP': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        const value = this.memory.read(address);
        const result = state.A - value;
        state.P = (state.P & ~FLAGS.CARRY) | (result >= 0 ? FLAGS.CARRY : 0);
        this.updateZeroAndNegativeFlags(state, result & 0xFF);
        cycles += extraCycles;
        break;
      }

      case 'CPX': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        const value = this.memory.read(address);
        const result = state.X - value;
        state.P = (state.P & ~FLAGS.CARRY) | (result >= 0 ? FLAGS.CARRY : 0);
        this.updateZeroAndNegativeFlags(state, result & 0xFF);
        cycles += extraCycles;
        break;
      }

      case 'CPY': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        const value = this.memory.read(address);
        const result = state.Y - value;
        state.P = (state.P & ~FLAGS.CARRY) | (result >= 0 ? FLAGS.CARRY : 0);
        this.updateZeroAndNegativeFlags(state, result & 0xFF);
        cycles += extraCycles;
        break;
      }

      // Increment/Decrement Operations
      case 'INC': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        const value = (this.memory.read(address) + 1) & 0xFF;
        this.memory.write(address, value);
        this.updateZeroAndNegativeFlags(state, value);
        cycles += extraCycles;
        break;
      }

      case 'INX': {
        state.X = (state.X + 1) & 0xFF;
        this.updateZeroAndNegativeFlags(state, state.X);
        break;
      }

      case 'INY': {
        state.Y = (state.Y + 1) & 0xFF;
        this.updateZeroAndNegativeFlags(state, state.Y);
        break;
      }

      case 'DEC': {
        const { address, cycles: extraCycles } = this.addressingModes.getOperandAddress(instruction.mode, state.PC);
        const value = (this.memory.read(address) - 1) & 0xFF;
        this.memory.write(address, value);
        this.updateZeroAndNegativeFlags(state, value);
        cycles += extraCycles;
        break;
      }

      case 'DEX': {
        state.X = (state.X - 1) & 0xFF;
        this.updateZeroAndNegativeFlags(state, state.X);
        break;
      }

      case 'DEY': {
        state.Y = (state.Y - 1) & 0xFF;
        this.updateZeroAndNegativeFlags(state, state.Y);
        break;
      }

      // System Operations
      case 'NOP': {
        break;
      }

      // Previously implemented instructions...
    }

    return cycles;
  }

  private updateZeroAndNegativeFlags(state: any, value: number): void {
    state.P = (state.P & ~(FLAGS.ZERO | FLAGS.NEGATIVE)) |
      (value === 0 ? FLAGS.ZERO : 0) |
      (value & FLAGS.NEGATIVE);
  }

  // Previously implemented helper methods...
}