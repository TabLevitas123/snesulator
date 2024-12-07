import { CPU } from '../CPU';
import { Memory } from '../Memory';
import { AddressingModes } from './addressing';
import { opcodeMap } from './opcodes';
import { InstructionExecutor } from './InstructionExecutor';

export class InstructionSet {
  private addressingModes: AddressingModes;
  private executor: InstructionExecutor;

  constructor(private cpu: CPU, private memory: Memory) {
    this.addressingModes = new AddressingModes(memory);
    this.executor = new InstructionExecutor(cpu, memory);
  }

  public execute(opcode: number): number {
    const instruction = opcodeMap.find(op => op.opcode === opcode);
    if (!instruction) {
      console.warn(`Unknown opcode: ${opcode.toString(16)}`);
      return 2;
    }

    const state = this.cpu.getState();
    const cycles = this.executor.executeInstruction(instruction, state);
    this.cpu.setState(state);

    return cycles;
  }
}