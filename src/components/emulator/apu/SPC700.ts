export class SPC700 {
  private ram: Uint8Array;
  private a: number = 0;    // Accumulator
  private x: number = 0;    // X index register
  private y: number = 0;    // Y index register
  private sp: number = 0;   // Stack pointer
  private pc: number = 0;   // Program counter
  private psw: number = 0;  // Program status word

  constructor(ram: Uint8Array) {
    this.ram = ram;
  }

  public reset(): void {
    this.a = 0;
    this.x = 0;
    this.y = 0;
    this.sp = 0xEF;
    this.pc = 0xFFC0;
    this.psw = 0;
  }

  public step(): number {
    const opcode = this.read(this.pc++);
    return this.executeInstruction(opcode);
  }

  private read(address: number): number {
    return this.ram[address];
  }

  private write(address: number, value: number): void {
    this.ram[address] = value;
  }

  private executeInstruction(opcode: number): number {
    // Initial implementation with basic instructions
    switch (opcode) {
      case 0x00: // NOP
        return 2;
      
      case 0xE8: // MOV A, #imm
        this.a = this.read(this.pc++);
        return 2;
      
      case 0xCD: // MOV X, #imm
        this.x = this.read(this.pc++);
        return 2;
      
      case 0x8D: // MOV Y, #imm
        this.y = this.read(this.pc++);
        return 2;
      
      default:
        console.warn(`Unknown SPC700 opcode: ${opcode.toString(16)}`);
        return 2;
    }
  }

  public getState() {
    return {
      a: this.a,
      x: this.x,
      y: this.y,
      sp: this.sp,
      pc: this.pc,
      psw: this.psw
    };
  }
}