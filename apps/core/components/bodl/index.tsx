'use client';

import Script from 'next/script';

export default function Bodl() {
  // TODO: Replace with actual store configuration
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? '';
  const developerId = 0;
  const consentModeEnabled = 'false';

  return (
    <>
      {/* TODO: Consider afterInteractive or other less harmful strategy */}
      <Script
        id="_bc-bodl"
        strategy="beforeInteractive"
        src="https://microapps.bigcommerce.com/bodl-events/index.js"
      />
      <Script id="_bc-ga4" strategy="beforeInteractive" src="/js/google_analytics4.js" />
      <Script
        id="_bc-ga-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function initGA4(event) {
              if (typeof subscribeOnBodlEvents === 'function') {
                subscribeOnBodlEvents('${gaId}', '${developerId}', ${consentModeEnabled});
              }

              window.removeEventListener(event.type, initGA4);
            }
          
            var eventName = document.readyState === 'complete' ? 'consentScriptsLoaded' : 'load';
            window.addEventListener(eventName, initGA4, false);
      `,
        }}
      />
      <Script
        id="_bc-ga"
        strategy="beforeInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
    </>
  );
}
