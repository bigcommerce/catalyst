'use client';

import { ConsentManagerProvider } from '@c15t/nextjs';
import { PropsWithChildren } from 'react';

import { setConsent, showConsentBanner, verifyConsent } from '~/lib/consent-manager/handlers';

import { ConsentManagerDialog } from './consent-manager-dialog';
import { CookieBanner } from './cookie-banner';

interface Props extends PropsWithChildren {
  cookieConsentEnabled?: boolean;
}

export function ConsentManager({ children, cookieConsentEnabled }: Props) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'custom',
        consentCategories: ['necessary', 'functionality', 'marketing', 'measurement'],

        // @ts-expect-error endpointHandlers type is not yet exposed by the package
        endpointHandlers: {
          showConsentBanner: () => showConsentBanner(cookieConsentEnabled),
          setConsent,
          verifyConsent,
        },
      }}
    >
      <ConsentManagerDialog />
      <CookieBanner />
      {children}
    </ConsentManagerProvider>
  );
}
