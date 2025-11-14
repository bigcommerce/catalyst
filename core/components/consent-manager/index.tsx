'use client';

import { ConsentManagerDialog, CookieBanner } from '@c15t/nextjs';
import type { PropsWithChildren } from 'react';

// import { ConsentManagerDialog } from './consent-manager-dialog';
import { type C15tScripts, ConsentManagerProvider } from './consent-providers';
// import { CookieBanner } from './cookie-banner';

interface ConsentManagerProps extends PropsWithChildren {
  scripts: C15tScripts;
  isCookieConsentEnabled: boolean;
}

export function ConsentManager({ children, scripts, isCookieConsentEnabled }: ConsentManagerProps) {
  return (
    <ConsentManagerProvider isCookieConsentEnabled={isCookieConsentEnabled} scripts={scripts}>
      {/* @ts-expect-error ConsentManagerDialog is not yet exported by the package */}
      <ConsentManagerDialog />
      {/* @ts-expect-error CookieBanner is not yet exported by the package */}
      <CookieBanner />
      {children}
    </ConsentManagerProvider>
  );
}
