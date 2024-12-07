import { InterruptType } from './InterruptController';
import { InterruptPriorityHandler } from './InterruptPriority';

export class InterruptQueue {
  private queue: InterruptType[];
  private maxSize: number;

  constructor(maxSize: number = 16) {
    this.queue = [];
    this.maxSize = maxSize;
  }

  public enqueue(type: InterruptType): boolean {
    if (this.queue.length >= this.maxSize) {
      return false;
    }

    // Insert the interrupt in priority order
    const insertIndex = this.queue.findIndex(existing =>
      InterruptPriorityHandler.comparePriority(type, existing) < 0
    );

    if (insertIndex === -1) {
      this.queue.push(type);
    } else {
      this.queue.splice(insertIndex, 0, type);
    }

    return true;
  }

  public dequeue(): InterruptType | undefined {
    return this.queue.shift();
  }

  public peek(): InterruptType | undefined {
    return this.queue[0];
  }

  public clear(): void {
    this.queue = [];
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public size(): number {
    return this.queue.length;
  }

  public contains(type: InterruptType): boolean {
    return this.queue.includes(type);
  }

  public removeType(type: InterruptType): void {
    this.queue = this.queue.filter(t => t !== type);
  }
}