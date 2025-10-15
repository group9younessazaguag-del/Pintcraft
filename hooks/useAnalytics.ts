import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const useAnalytics = (analyticsId?: string, adsId?: string) => {
  useEffect(() => {
    if (typeof window.gtag !== 'function') {
      return;
    }
    
    if (analyticsId) {
      window.gtag('config', analyticsId);
    }
    if (adsId) {
        window.gtag('config', adsId);
    }
  }, [analyticsId, adsId]);
};
