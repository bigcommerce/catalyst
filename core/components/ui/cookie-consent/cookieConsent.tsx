'use client';

import { useEffect } from 'react';
interface CookieConsentProps {
  url: string;
}

const CookieConsent = ({ url }: CookieConsentProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    // Get head element with null check
    const head = document.head || document.getElementsByTagName('head')[0];

    if (head) {
      head.appendChild(script);

      // Cleanup function
      return () => {
        head.removeChild(script);
      };
    }
  }, [url]);

  return null;
};

export default CookieConsent;
