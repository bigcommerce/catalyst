import type { PropsWithChildren } from 'react';

import { ConsentManagerDialog } from './consent-manager-dialog';
import { type C15tScripts, ConsentManagerProvider } from './consent-providers';
import { CookieBanner } from './cookie-banner';

interface ConsentManagerProps extends PropsWithChildren {
  scripts: C15tScripts;
  isCookieConsentEnabled: boolean;
  privacyPolicyUrl?: string | null;
}

export function ConsentManager({
  children,
  scripts,
  isCookieConsentEnabled,
  privacyPolicyUrl,
}: ConsentManagerProps) {
  return (
    <ConsentManagerProvider isCookieConsentEnabled={isCookieConsentEnabled} scripts={scripts}>
      <ConsentManagerDialog />
      <CookieBanner privacyPolicyUrl={privacyPolicyUrl} />
      {children}
    </ConsentManagerProvider>
  );
}
