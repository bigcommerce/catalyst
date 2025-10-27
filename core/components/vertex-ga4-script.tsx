/**
 * Vertex AI GA4 Script Component
 * Loads Google Analytics 4 script using Next.js Script component
 * Based on: https://nextjs.org/docs/messages/next-script-for-ga
 * 
 * This component ensures GA4 is loaded for Vertex AI event tracking.
 * It works alongside the existing GoogleAnalyticsProvider and avoids duplicate script loading.
 */

import Script from 'next/script';
import { FragmentOf } from '~/client/graphql';

import { WebAnalyticsFragment } from './analytics/fragment';

interface Props {
  settings?: FragmentOf<typeof WebAnalyticsFragment> | null;
}

export function VertexGA4Script({ settings }: Props) {
  // Use GA4 ID from GraphQL settings, or fallback to environment variable
  const gaId = settings?.webAnalytics?.ga4?.tagId || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  if (!gaId) {
    return null;
  }

  return (
    <>
      {/* Initialize dataLayer and gtag function if not already initialized */}
      <Script
        id="ga4-data-layer"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            if (!window.gtag || !document.getElementById('ga4-config')) {
              gtag('config', '${gaId}');
              window.gtag = gtag;
            }
          `,
        }}
      />
      {/* Load GA4 script if not already loaded */}
      <Script
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
    </>
  );
}

