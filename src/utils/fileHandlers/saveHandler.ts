export class SaveHandler {
  private static readonly SAVE_EXTENSION = '.sav';
  private static readonly MAGIC_BYTES = new Uint8Array([0x53, 0x4E, 0x45, 0x53]); // "SNES"

  public static isValidSaveFile(file: File): boolean {
    return file.name.toLowerCase().endsWith(this.SAVE_EXTENSION);
  }

  public static async readSaveFile(file: File): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    
    if (!this.validateMagicBytes(data)) {
      throw new Error('Invalid save file format');
    }
    
    return data;
  }

  private static validateMagicBytes(data: Uint8Array): boolean {
    if (data.length < this.MAGIC_BYTES.length) return false;
    
    for (let i = 0; i < this.MAGIC_BYTES.length; i++) {
      if (data[i] !== this.MAGIC_BYTES[i]) return false;
    }
    
    return true;
  }

  public static async writeSaveFile(data: Uint8Array, filename: string): Promise<void> {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.sav') ? filename : `${filename}.sav`;
      document.body.appendChild(a);
      a.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}