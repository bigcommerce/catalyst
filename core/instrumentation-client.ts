// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1,
    sendDefaultPii: true,
  });
}

export const onRouterTransitionStart = (
  url: string,
  navigationType: 'push' | 'replace' | 'traverse',
) => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureRouterTransitionStart(url, navigationType);
  }
};
