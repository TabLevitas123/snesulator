export enum InterruptPriority {
  RESET = 0,  // Highest priority
  NMI = 1,
  BRK = 2,
  IRQ = 3     // Lowest priority
}

export class InterruptPriorityHandler {
  private static readonly priorities = new Map([
    ['RESET', InterruptPriority.RESET],
    ['NMI', InterruptPriority.NMI],
    ['BRK', InterruptPriority.BRK],
    ['IRQ', InterruptPriority.IRQ]
  ]);

  public static getPriority(interruptType: string): number {
    return this.priorities.get(interruptType) ?? InterruptPriority.IRQ;
  }

  public static comparePriority(a: string, b: string): number {
    const priorityA = this.getPriority(a);
    const priorityB = this.getPriority(b);
    return priorityA - priorityB;
  }

  public static shouldHandle(type: string, currentFlags: number): boolean {
    // RESET and NMI are always handled
    if (type === 'RESET' || type === 'NMI') return true;

    // IRQ is only handled if the interrupt disable flag is clear
    if (type === 'IRQ') return (currentFlags & 0x04) === 0;

    // BRK is handled like IRQ
    if (type === 'BRK') return (currentFlags & 0x04) === 0;

    return false;
  }
}