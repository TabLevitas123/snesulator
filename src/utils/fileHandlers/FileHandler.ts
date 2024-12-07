import { EventEmitter } from 'events';

export class FileHandler {
  private static instance: FileHandler;
  private emitter: EventEmitter;
  private acceptedTypes: Set<string>;

  private constructor() {
    this.emitter = new EventEmitter();
    this.acceptedTypes = new Set(['.smc', '.sfc']);
  }

  public static getInstance(): FileHandler {
    if (!FileHandler.instance) {
      FileHandler.instance = new FileHandler();
    }
    return FileHandler.instance;
  }

  public isValidFile(file: File): boolean {
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return this.acceptedTypes.has(extension);
  }

  public async readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    this.emitter.on(event, callback);
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    this.emitter.off(event, callback);
  }

  public emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }
}