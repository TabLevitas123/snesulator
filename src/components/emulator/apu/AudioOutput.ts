import { EventEmitter } from 'events';

export class AudioOutput {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private sampleBuffer: Float32Array;
  private sampleRate: number;
  private bufferSize: number;
  private events: EventEmitter;
  private volume: number;
  private enabled: boolean;

  constructor(sampleRate: number = 44100, bufferSize: number = 2048) {
    this.sampleRate = sampleRate;
    this.bufferSize = bufferSize;
    this.sampleBuffer = new Float32Array(bufferSize * 2); // Stereo buffer
    this.events = new EventEmitter();
    this.volume = 1.0;
    this.enabled = false;
  }

  public async initialize(): Promise<void> {
    try {
      this.audioContext = new AudioContext({
        sampleRate: this.sampleRate,
        latencyHint: 'interactive'
      });

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);

      // Create script processor for sample processing
      this.scriptNode = this.audioContext.createScriptProcessor(
        this.bufferSize,
        0, // No input channels
        2  // Stereo output
      );

      this.scriptNode.onaudioprocess = this.handleAudioProcess.bind(this);
      this.scriptNode.connect(this.gainNode);

      await this.audioContext.resume();
      this.enabled = true;
      this.events.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize audio output:', error);
      this.events.emit('error', error);
      throw error;
    }
  }

  private handleAudioProcess(event: AudioProcessingEvent): void {
    const outputL = event.outputBuffer.getChannelData(0);
    const outputR = event.outputBuffer.getChannelData(1);

    // Copy samples from our buffer to the output channels
    for (let i = 0; i < this.bufferSize; i++) {
      outputL[i] = this.sampleBuffer[i * 2];
      outputR[i] = this.sampleBuffer[i * 2 + 1];
    }

    // Clear the buffer after processing
    this.sampleBuffer.fill(0);
    this.events.emit('bufferProcessed');
  }

  public pushSample(left: number, right: number): void {
    if (!this.enabled) return;

    // Convert from 16-bit integer to float
    const floatL = Math.max(-1, Math.min(1, left / 32768));
    const floatR = Math.max(-1, Math.min(1, right / 32768));

    // Find the next available position in the buffer
    let position = 0;
    while (position < this.sampleBuffer.length && this.sampleBuffer[position] !== 0) {
      position += 2;
    }

    if (position < this.sampleBuffer.length) {
      this.sampleBuffer[position] = floatL;
      this.sampleBuffer[position + 1] = floatR;
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext?.currentTime || 0);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public suspend(): void {
    this.audioContext?.suspend();
    this.enabled = false;
  }

  public resume(): void {
    this.audioContext?.resume();
    this.enabled = true;
  }

  public reset(): void {
    this.sampleBuffer.fill(0);
    if (this.enabled) {
      this.suspend();
      this.resume();
    }
  }

  public destroy(): void {
    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.enabled = false;
    this.events.emit('destroyed');
  }

  public onError(callback: (error: Error) => void): void {
    this.events.on('error', callback);
  }

  public onBufferProcessed(callback: () => void): void {
    this.events.on('bufferProcessed', callback);
  }
}