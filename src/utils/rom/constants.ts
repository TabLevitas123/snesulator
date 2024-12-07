export const ROM_CONSTANTS = {
  VALID_EXTENSIONS: ['.smc', '.sfc'] as const,
  MIN_SIZE: 0x8000, // 32KB
  MAX_SIZE: 0x800000, // 8MB
  SMC_HEADER_SIZE: 512,
  HEADER_OFFSET: 0x7FC0,
  TITLE_LENGTH: 21,
} as const;

export const ERROR_MESSAGES = {
  INVALID_TYPE: (ext: string) => 
    `Invalid file type: ${ext}. Supported formats: ${ROM_CONSTANTS.VALID_EXTENSIONS.join(', ')}`,
  FILE_TOO_SMALL: (size: number) => 
    `ROM file too small (${(size / 1024).toFixed(1)}KB). Minimum size: ${(ROM_CONSTANTS.MIN_SIZE / 1024).toFixed(1)}KB`,
  FILE_TOO_LARGE: (size: number) => 
    `ROM file too large (${(size / 1024 / 1024).toFixed(1)}MB). Maximum size: ${(ROM_CONSTANTS.MAX_SIZE / 1024 / 1024).toFixed(1)}MB`,
  INVALID_SIZE: 'Invalid ROM size. Must be a multiple of 1KB',
  PARSE_ERROR: 'Failed to parse ROM header',
  READ_ERROR: 'Failed to read ROM file',
} as const;