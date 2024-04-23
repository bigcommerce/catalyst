// @ts-nocheck

'use client';

import Script from 'next/script';
import { v4 as uuidv4 } from 'uuid';

export default function Bodl() {
  // TODO: Replace with actual store configuration
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? '';
  const developerId = 0;
  const consentModeEnabled = 'false';

  return (
    <>
      <Script id="_bc-bodl" src="https://microapps.bigcommerce.com/bodl-events/index.js" />
      <Script id="_bc-ga4" src="/js/google_analytics4.js" />
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
      <Script id="_bc-ga" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
    </>
  );
}

export function sendBodlEvent(events) {
  if (!window.bodlEvents) {
    console.warn('Bodl is not initialized correctly. Add <Bodl /> component to your app.');
    return;
  }
  const basicEvent = {
    event_id: uuidv4(),
    channel_id: process.env.BIGCOMMERCE_CHANNEL_ID ?? '1',
  };

  Object.entries(events).forEach((scope) => {
    switch (scope[0]) {
      case 'cart': {
        Object.entries(scope[1]).forEach((event) => {
          switch (event[0]) {
            case 'added': {
              window.bodlEvents.cart.emit(window.bodlEvents.AddCartItemEvent.CREATE, {
                ...basicEvent,
                ...event[1],
              });
              break;
            }
          }
        });
        break;
      }
    }
  });
}
