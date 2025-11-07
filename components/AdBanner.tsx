import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  adScript: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ adScript }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adContainer = adContainerRef.current;
    if (adScript && adContainer) {
      // Clear any previous ad content
      adContainer.innerHTML = '';

      // Create a temporary div to parse the script string
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = adScript;

      // Move all child nodes from tempDiv to the ad container
      // This includes any non-script elements the ad provider might include
      Array.from(tempDiv.childNodes).forEach(node => {
        adContainer.appendChild(node.cloneNode(true));
      });

      // Find all script tags within the newly added content and re-create them
      // to ensure they execute. Setting innerHTML doesn't execute scripts.
      const scripts = Array.from(adContainer.getElementsByTagName('script'));
      scripts.forEach((oldScript: HTMLScriptElement) => {
        const newScript = document.createElement('script');
        
        // Copy all attributes (src, async, etc.)
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy inline script content
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }
        
        // Replace the non-executable script with the new, executable one
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [adScript]);

  if (!adScript) {
    return null;
  }

  // The ad script injected in the useEffect will populate this container.
  return (
    <div className="container mx-auto mb-8 text-center">
      <div
        ref={adContainerRef}
        className="min-h-[50px] flex items-center justify-center"
      >
        {/* Ad script content will be dynamically injected here */}
      </div>
    </div>
  );
};

export default AdBanner;
