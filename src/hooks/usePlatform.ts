import { useState, useEffect } from 'react';
import { Platform, PlatformCapabilities, getPlatformCapabilities } from '../utils/platform';
import { detect } from '../utils/platformDetect';

export const usePlatform = () => {
  const [platform, setPlatform] = useState<Platform>('web');
  const [capabilities, setCapabilities] = useState<PlatformCapabilities>(getPlatformCapabilities());

  useEffect(() => {
    const currentPlatform = detect();
    setPlatform(currentPlatform);
    setCapabilities(getPlatformCapabilities());

    const handleResize = () => {
      setCapabilities(getPlatformCapabilities());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    platform,
    capabilities,
    isMobile: platform === 'ios' || platform === 'android',
    isDesktop: ['windows', 'macos', 'linux'].includes(platform),
  };
};