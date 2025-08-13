'use client';

import { useEffect } from 'react';

interface CheckoutPrerenderProps {
  locale?: string;
}

export function CheckoutPrerender({ locale }: CheckoutPrerenderProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Construct the checkout URL with locale if provided
    const checkoutUrl = '/checkout/';

    // Create speculation rules script
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify({
      prerender: [
        {
          source: 'list',
          urls: [checkoutUrl]
        }
      ]
    });
    script.id = 'checkout-prerender-rules';

    // Remove any existing script
    const existingScript = document.getElementById('checkout-prerender-rules');
    if (existingScript) {
      existingScript.remove();
    }

    // Add the script to the document head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById('checkout-prerender-rules');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [locale]);

  return null; // This component doesn't render anything
}
