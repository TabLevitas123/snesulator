import { CPU } from '../CPU';
import { Memory } from '../Memory';
import { InterruptController, InterruptType } from './InterruptController';
import { FLAGS } from '../../../utils/cpuUtils';

export class InterruptHandler {
  private cpu: CPU;
  private memory: Memory;
  private controller: InterruptController;
  private interruptQueue: InterruptType[];
  private cyclesSinceLastInterrupt: number;
  private processingInterrupt: boolean;

  constructor(cpu: CPU, memory: Memory, controller: InterruptController) {
    this.cpu = cpu;
    this.memory = memory;
    this.controller = controller;
    this.interruptQueue = [];
    this.cyclesSinceLastInterrupt = 0;
    this.processingInterrupt = false;
  }

  public queueInterrupt(type: InterruptType): void {
    // NMI and RESET have highest priority and should be handled immediately
    if (type === InterruptType.NMI || type === InterruptType.RESET) {
      this.interruptQueue.unshift(type);
    } else {
      this.interruptQueue.push(type);
    }
  }

  public handlePendingInterrupts(): number {
    if (this.interruptQueue.length === 0 || this.processingInterrupt) return 0;

    const state = this.cpu.getState();
    let cyclesUsed = 0;

    // Process all pending interrupts in order of priority
    while (this.interruptQueue.length > 0) {
      const type = this.interruptQueue[0];

      // Skip IRQ if interrupts are disabled (except for NMI and RESET)
      if (type === InterruptType.IRQ && (state.P & FLAGS.IRQ_DISABLE)) {
        this.interruptQueue.shift();
        continue;
      }

      this.processingInterrupt = true;
      cyclesUsed += this.handleInterrupt(type);
      this.interruptQueue.shift();
      this.processingInterrupt = false;
    }

    return cyclesUsed;
  }

  private handleInterrupt(type: InterruptType): number {
    const state = this.cpu.getState();
    let cycles = 7; // Base cycles for interrupt handling

    // Save current state
    this.pushStack((state.PC >> 8) & 0xFF); // PCH
    this.pushStack(state.PC & 0xFF);        // PCL

    // Push status register with B flag set for BRK, clear for hardware interrupts
    const statusToPush = type === InterruptType.BRK
      ? state.P | FLAGS.BREAK
      : state.P & ~FLAGS.BREAK;
    this.pushStack(statusToPush);

    // Set interrupt disable flag
    state.P |= FLAGS.IRQ_DISABLE;

    // Load interrupt vector
    switch (type) {
      case InterruptType.NMI:
        state.PC = this.readVector(0xFFEA);
        break;
      case InterruptType.IRQ:
        state.PC = this.readVector(0xFFEE);
        break;
      case InterruptType.RESET:
        state.PC = this.readVector(0xFFFC);
        state.SP = 0xFF;  // Reset stack pointer
        state.P |= FLAGS.IRQ_DISABLE; // Set interrupt disable
        cycles = 8; // RESET takes an extra cycle
        break;
      case InterruptType.BRK:
        state.PC = this.readVector(0xFFE6);
        break;
    }

    this.cpu.setState(state);
    this.cyclesSinceLastInterrupt = 0;

    return cycles;
  }

  private pushStack(value: number): void {
    const state = this.cpu.getState();
    this.memory.write(0x100 + state.SP, value);
    state.SP = (state.SP - 1) & 0xFF;
    this.cpu.setState(state);
  }

  private readVector(address: number): number {
    const low = this.memory.read(address);
    const high = this.memory.read(address + 1);
    return (high << 8) | low;
  }

  public reset(): void {
    this.interruptQueue = [];
    this.cyclesSinceLastInterrupt = 0;
    this.processingInterrupt = false;
    this.controller.requestInterrupt(InterruptType.RESET);
  }
}