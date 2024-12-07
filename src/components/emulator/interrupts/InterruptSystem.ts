import { CPU } from '../CPU';
import { Memory } from '../Memory';
import { InterruptController, InterruptType } from './InterruptController';
import { InterruptHandler } from './InterruptHandler';
import { InterruptQueue } from './InterruptQueue';
import { InterruptPriorityHandler } from './InterruptPriority';
import { EventEmitter } from 'events';

export class InterruptSystem {
  private cpu: CPU;
  private memory: Memory;
  private controller: InterruptController;
  private handler: InterruptHandler;
  private queue: InterruptQueue;
  private events: EventEmitter;
  private enabled: boolean;
  private cyclesSinceLastInterrupt: number;
  private vblankPending: boolean;

  constructor(cpu: CPU, memory: Memory) {
    this.cpu = cpu;
    this.memory = memory;
    this.controller = new InterruptController(cpu, memory);
    this.handler = new InterruptHandler(cpu, memory, this.controller);
    this.queue = new InterruptQueue();
    this.events = new EventEmitter();
    this.enabled = true;
    this.cyclesSinceLastInterrupt = 0;
    this.vblankPending = false;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.controller.onInterrupt((type: InterruptType) => {
      this.handleInterruptRequest(type);
    });
  }

  public handleInterruptRequest(type: InterruptType): void {
    if (!this.enabled) return;

    // Check if we should handle this interrupt based on current CPU flags
    const state = this.cpu.getState();
    if (!InterruptPriorityHandler.shouldHandle(type, state.P)) {
      return;
    }

    // Special handling for VBlank
    if (type === InterruptType.NMI) {
      this.vblankPending = true;
    }

    // Add to queue based on priority
    this.queue.enqueue(type);
    this.events.emit('interruptQueued', type);
  }

  public update(cycles: number): number {
    if (!this.enabled) return 0;

    this.cyclesSinceLastInterrupt += cycles;
    let cyclesUsed = 0;

    // Check for VBlank (occurs every ~16.6ms / 262 scanlines)
    if (this.cyclesSinceLastInterrupt >= 1364) { // Master clock / 4
      if (!this.vblankPending) {
        this.handleInterruptRequest(InterruptType.NMI);
      }
      this.cyclesSinceLastInterrupt -= 1364;
    }

    // Process any pending interrupts
    if (!this.queue.isEmpty()) {
      cyclesUsed = this.handler.handlePendingInterrupts();
      if (cyclesUsed > 0) {
        this.vblankPending = false;
        this.events.emit('interruptsProcessed', cyclesUsed);
      }
    }

    return cyclesUsed;
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
    this.queue.clear();
    this.vblankPending = false;
  }

  public reset(): void {
    this.queue.clear();
    this.handler.reset();
    this.controller.reset();
    this.enabled = true;
    this.cyclesSinceLastInterrupt = 0;
    this.vblankPending = false;
    this.events.emit('systemReset');
  }

  public onInterruptQueued(callback: (type: InterruptType) => void): void {
    this.events.on('interruptQueued', callback);
  }

  public onInterruptsProcessed(callback: (cycles: number) => void): void {
    this.events.on('interruptsProcessed', callback);
  }

  public onSystemReset(callback: () => void): void {
    this.events.on('systemReset', callback);
  }

  public getQueueSize(): number {
    return this.queue.size();
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public isVBlankPending(): boolean {
    return this.vblankPending;
  }
}