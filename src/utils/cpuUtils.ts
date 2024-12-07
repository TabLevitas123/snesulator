export const FLAGS = {
  CARRY: 0x01,
  ZERO: 0x02,
  IRQ_DISABLE: 0x04,
  DECIMAL: 0x08,
  BREAK: 0x10,
  UNUSED: 0x20,
  OVERFLOW: 0x40,
  NEGATIVE: 0x80,
};

export function setFlag(status: number, flag: number, value: boolean): number {
  return value ? status | flag : status & ~flag;
}

export function getFlag(status: number, flag: number): boolean {
  return (status & flag) !== 0;
}

export function updateZeroAndNegativeFlags(value: number, status: number): number {
  let newStatus = status;
  newStatus = setFlag(newStatus, FLAGS.ZERO, (value & 0xFF) === 0);
  newStatus = setFlag(newStatus, FLAGS.NEGATIVE, (value & 0x80) !== 0);
  return newStatus;
}