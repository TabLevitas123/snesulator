import { detect } from './platformDetect';

export type Platform = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'web';

export interface PlatformCapabilities {
  fullscreen: boolean;
  gamepad: boolean;
  keyboard: boolean;
  touch: boolean;
  audio: boolean;
  fileSystem: boolean;
  webGL: boolean;
}

export const getPlatformCapabilities = (): PlatformCapabilities => {
  const platform = detect();
  
  return {
    fullscreen: !['ios', 'android'].includes(platform),
    gamepad: platform !== 'ios',
    keyboard: true,
    touch: ['ios', 'android'].includes(platform) || 'ontouchstart' in window,
    audio: true,
    fileSystem: !['ios', 'android'].includes(platform),
    webGL: detectWebGL(),
  };
};

const detectWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};