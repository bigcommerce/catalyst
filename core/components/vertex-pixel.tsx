/**
 * Vertex AI Retail JavaScript Pixel Component
 * Initializes the Vertex AI event tracking pixel library
 */

'use client';

import { useEffect } from 'react';

export function VertexPixel() {
  useEffect(() => {
    // Only initialize if we have the required environment variables
    const apiKey = process.env.NEXT_PUBLIC_VERTEX_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID;

    if (!apiKey || !projectId) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Vertex Pixel] Missing environment variables. Set NEXT_PUBLIC_VERTEX_API_KEY and NEXT_PUBLIC_GCP_PROJECT_ID',
      );

      return;
    }

    // Initialize the _gre queue if it doesn't exist
    if (typeof window !== 'undefined') {
      if (!window._gre) {
        window._gre = [] as unknown as Array<[string, unknown]> & {
          push: (command: [string, unknown]) => void;
        };
      }

      // Configure the pixel
      window._gre.push(['apiKey', apiKey]);
      window._gre.push(['projectId', projectId]);
      window._gre.push(['locationId', process.env.NEXT_PUBLIC_VERTEX_RETAIL_LOCATION || 'global']);
      window._gre.push(['catalogId', process.env.NEXT_PUBLIC_VERTEX_RETAIL_CATALOG || 'default_catalog']);

      // eslint-disable-next-line no-console
      console.log('[Vertex Pixel] Configured with project:', projectId);

      // Load the pixel library if not already loaded
      if (!document.querySelector('script[src*="v2_event.js"]')) {
        const script = document.createElement('script');

        script.src = 'https://www.gstatic.com/retail/v2_event.js';
        script.async = true;
        script.onload = () => {
          // eslint-disable-next-line no-console
          console.log('[Vertex Pixel] Library loaded successfully');
        };
        script.onerror = () => {
          // eslint-disable-next-line no-console
          console.error('[Vertex Pixel] Failed to load library');
        };

        document.head.appendChild(script);
      }
    }
  }, []);

  return null;
}
