import { EventEmitter } from 'events';
import { CPU } from '../CPU';
import { Memory } from '../Memory';
import { FLAGS } from '../../../utils/cpuUtils';

export enum InterruptType {
  NMI = 'NMI',   // Non-Maskable Interrupt
  IRQ = 'IRQ',   // Interrupt Request
  RESET = 'RESET', // Reset Vector
  BRK = 'BRK'    // Software Break
}

export class InterruptController {
  private cpu: CPU;
  private memory: Memory;
  private events: EventEmitter;
  private pendingInterrupts: Set<InterruptType>;
  private vectors: Map<InterruptType, number>;

  constructor(cpu: CPU, memory: Memory) {
    this.cpu = cpu;
    this.memory = memory;
    this.events = new EventEmitter();
    this.pendingInterrupts = new Set();
    this.vectors = new Map([
      [InterruptType.NMI, 0xFFEA],
      [InterruptType.IRQ, 0xFFEE],
      [InterruptType.RESET, 0xFFFC],
      [InterruptType.BRK, 0xFFE6]
    ]);
  }

  public requestInterrupt(type: InterruptType): void {
    this.pendingInterrupts.add(type);
    this.events.emit('interruptRequested', type);
  }

  public checkInterrupts(): boolean {
    const state = this.cpu.getState();

    // Handle NMI first (non-maskable)
    if (this.pendingInterrupts.has(InterruptType.NMI)) {
      this.handleInterrupt(InterruptType.NMI);
      return true;
    }

    // Handle IRQ if interrupts are enabled
    if (this.pendingInterrupts.has(InterruptType.IRQ) && 
        !(state.P & FLAGS.IRQ_DISABLE)) {
      this.handleInterrupt(InterruptType.IRQ);
      return true;
    }

    return false;
  }

  private handleInterrupt(type: InterruptType): void {
    const state = this.cpu.getState();
    const vector = this.vectors.get(type)!;

    // Push program counter and status to stack
    this.pushStack((state.PC >> 8) & 0xFF);
    this.pushStack(state.PC & 0xFF);
    this.pushStack(state.P);

    // Set interrupt disable flag
    state.P |= FLAGS.IRQ_DISABLE;

    // Load new program counter from interrupt vector
    state.PC = this.memory.read(vector) | (this.memory.read(vector + 1) << 8);

    // Clear the handled interrupt
    this.pendingInterrupts.delete(type);
    this.events.emit('interruptHandled', type);

    // Update CPU state
    this.cpu.setState(state);
  }

  private pushStack(value: number): void {
    const state = this.cpu.getState();
    this.memory.write(0x100 + state.SP, value);
    state.SP = (state.SP - 1) & 0xFF;
    this.cpu.setState(state);
  }

  public onInterrupt(callback: (type: InterruptType) => void): void {
    this.events.on('interruptHandled', callback);
  }

  public reset(): void {
    this.pendingInterrupts.clear();
    this.requestInterrupt(InterruptType.RESET);
  }
}