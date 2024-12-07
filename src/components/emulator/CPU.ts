import { Memory } from './Memory';
import { InstructionSet } from './instructions/InstructionSet';
import { InterruptSystem } from './interrupts/InterruptSystem';
import { InterruptType } from './interrupts/InterruptController';
import type { CPUState } from '../../types/emulator';

export class CPU {
  private memory: Memory;
  private state: CPUState;
  private cycles: number;
  private instructions: InstructionSet;
  private interrupts: InterruptSystem;
  private running: boolean;

  constructor(memory: Memory) {
    this.memory = memory;
    this.state = {
      A: 0,      // Accumulator
      X: 0,      // X Index Register
      Y: 0,      // Y Index Register
      SP: 0xFF,  // Stack Pointer
      PC: 0,     // Program Counter
      P: 0x34,   // Processor Status
    };
    this.cycles = 0;
    this.instructions = new InstructionSet(this, memory);
    this.interrupts = new InterruptSystem(this, memory);
    this.running = false;
  }

  public reset(): void {
    // Reset vector is at $FFFC-$FFFD
    this.interrupts.reset();
    this.cycles = 0;
    this.running = true;
  }

  public step(): number {
    if (!this.running) return 0;

    // Process any pending interrupts
    const interruptCycles = this.interrupts.update(this.cycles);
    if (interruptCycles > 0) {
      this.cycles += interruptCycles;
      return interruptCycles;
    }

    // Execute next instruction
    const opcode = this.memory.read(this.state.PC++);
    const cycles = this.instructions.execute(opcode);
    this.cycles += cycles;
    return cycles;
  }

  public getState(): CPUState {
    return { ...this.state };
  }

  public setState(newState: Partial<CPUState>): void {
    this.state = { ...this.state, ...newState };
  }

  public getCycles(): number {
    return this.cycles;
  }

  public stop(): void {
    this.running = false;
    this.interrupts.disable();
  }

  public resume(): void {
    this.running = true;
    this.interrupts.enable();
  }

  public isRunning(): boolean {
    return this.running;
  }

  public requestInterrupt(type: InterruptType): void {
    this.interrupts.handleInterruptRequest(type);
  }
}