export const detect = (): 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'web' => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  if (/windows/.test(userAgent)) {
    return 'windows';
  }
  
  if (/macintosh|mac os x/.test(userAgent)) {
    return 'macos';
  }
  
  if (/linux/.test(userAgent)) {
    return 'linux';
  }
  
  return 'web';
};