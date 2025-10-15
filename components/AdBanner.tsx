import React, { useEffect } from 'react';
import type { AdminSettings } from '../types';

interface AdBannerProps {
  settings: AdminSettings;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdBanner: React.FC<AdBannerProps> = ({ settings }) => {
  const { showAds, adClient, adSlot } = settings;

  useEffect(() => {
    if (showAds && adClient && adSlot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [showAds, adClient, adSlot]);

  if (!showAds || !adClient || !adSlot) {
    return null;
  }

  return (
    <div className="container mx-auto mb-8 text-center">
      <div className="bg-slate-200/70 rounded-lg p-2 min-h-[100px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
};

export default AdBanner;
