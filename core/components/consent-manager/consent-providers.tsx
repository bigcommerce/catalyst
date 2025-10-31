'use client';

import { ConsentManagerProvider as C15TConsentManagerProvider } from '@c15t/nextjs';
import { ClientSideOptionsProvider } from '@c15t/nextjs/client';
import type { ComponentProps, PropsWithChildren } from 'react';

import { setConsent, showConsentBanner, verifyConsent } from '~/lib/consent-manager/handlers';

export type C15tScripts = NonNullable<ComponentProps<typeof ClientSideOptionsProvider>['scripts']>;

interface ConsentManagerProviderProps extends PropsWithChildren {
  scripts: C15tScripts;
  isCookieConsentEnabled: boolean;
}

export function ConsentManagerProvider({
  children,
  scripts,
  isCookieConsentEnabled,
}: ConsentManagerProviderProps) {
  return (
    <C15TConsentManagerProvider
      options={{
        mode: 'custom',
        consentCategories: ['necessary', 'functionality', 'marketing', 'measurement'],

        // @ts-expect-error endpointHandlers type is not yet exposed by the package
        endpointHandlers: {
          showConsentBanner: () => showConsentBanner(isCookieConsentEnabled),
          setConsent,
          verifyConsent,
        },
      }}
    >
      <ClientSideOptionsProvider scripts={scripts}>{children}</ClientSideOptionsProvider>
    </C15TConsentManagerProvider>
  );
}
