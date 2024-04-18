'use client';

import Script from 'next/script';

export default function Bodl() {
  // TODO: Replace with actual store configuration
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? '';
  const developerId = 0;
  const consentModeEnabled = 'false';

  return (
    <>
      <Script id="_bc-bodl" src="https://microapps.bigcommerce.com/bodl-events/index.js" />
      <Script id="_bc-ga4" src="/js/google_analytics4.js" />
      <Script id="_bc-ga" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      {/* TODO: subscribing Bodl just before load event may be too late when consent manager is implemented */}
      <Script
        id="_bc-ga-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof subscribeOnBodlEvents === 'function') {
              subscribeOnBodlEvents('${gaId}', '${developerId}', ${consentModeEnabled});
            }
      `,
        }}
      />
    </>
  );
}
