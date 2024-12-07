export interface ChecksumDetails {
  calculated: number;
  expected: number;
  complement: number;
}

export interface ValidationResult {
  isValid: boolean;
  details?: ChecksumDetails;
  error?: string;
}

export interface LoadProgress {
  step: 'validation' | 'reading' | 'parsing' | 'checksum' | 'complete';
  timestamp: number;
  details?: Record<string, any>;
}