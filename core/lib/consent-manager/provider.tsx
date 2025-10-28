'use client';

import { ConsentManagerProvider as C15TConsentManagerProvider } from '@c15t/nextjs';
import { type PropsWithChildren } from 'react';

import { setConsent, showConsentBanner, verifyConsent } from './handlers';

export function ConsentManagerProvider({ children }: PropsWithChildren) {
  return (
    <C15TConsentManagerProvider
      options={{
        mode: 'custom',
        consentCategories: ['necessary', 'functionality', 'marketing', 'measurement'],

        // @ts-expect-error endpointHandlers type is not yet exposed by the package
        endpointHandlers: {
          showConsentBanner,
          setConsent,
          verifyConsent,
        },
      }}
    >
      {children}
    </C15TConsentManagerProvider>
  );
}
