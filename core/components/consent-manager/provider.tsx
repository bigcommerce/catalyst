'use client';

import { ConsentManagerProvider as C15TConsentManagerProvider } from '@c15t/nextjs';
import { type PropsWithChildren } from 'react';

import { setConsent, showConsentBanner, verifyConsent } from './client';

export function ConsentManagerProvider({ children }: PropsWithChildren) {
  return (
    <C15TConsentManagerProvider
      options={{
        mode: 'custom',
        consentCategories: ['necessary', 'experience', 'functionality', 'marketing', 'measurement'],
        // @ts-expect-error type is not yet defined in the package
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
