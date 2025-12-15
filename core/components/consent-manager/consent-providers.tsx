import { ConsentManagerProvider as C15TConsentManagerProvider } from '@c15t/nextjs';
import { ClientSideOptionsProvider } from '@c15t/nextjs/client';
import type { ComponentProps, PropsWithChildren } from 'react';

import { CONSENT_COOKIE_NAME } from '~/lib/consent-manager/cookies/constants';

export type C15tScripts = NonNullable<ComponentProps<typeof ClientSideOptionsProvider>['scripts']>;

interface ConsentManagerProviderProps extends PropsWithChildren {
  scripts: C15tScripts;
  isCookieConsentEnabled: boolean;
  privacyPolicyUrl?: string | null;
}

export function ConsentManagerProvider({
  children,
  scripts,
  isCookieConsentEnabled,
}: ConsentManagerProviderProps) {
  return (
    <C15TConsentManagerProvider
      options={{
        mode: 'offline',
        storageConfig: {
          storageKey: CONSENT_COOKIE_NAME,
          crossSubdomain: true,
        },
        consentCategories: ['necessary', 'functionality', 'marketing', 'measurement'],
        enabled: isCookieConsentEnabled,
      }}
    >
      <ClientSideOptionsProvider scripts={scripts}>{children}</ClientSideOptionsProvider>
    </C15TConsentManagerProvider>
  );
}
