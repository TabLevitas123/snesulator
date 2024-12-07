export class ROMValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ROMValidationError';
  }
}

export class ROMLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ROMLoadError';
  }
}