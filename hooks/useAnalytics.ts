import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const useAnalytics = (analyticsId?: string) => {
  useEffect(() => {
    if (typeof window.gtag !== 'function') {
      return;
    }
    
    if (analyticsId) {
      window.gtag('config', analyticsId);
    }
  }, [analyticsId]);
};