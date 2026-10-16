import type { PropsWithChildren } from 'react';

import { isAnalyticsDisabled } from '~/lib/analytics/is-analytics-disabled';

import { ConsentManagerDialog } from './consent-manager-dialog';
import { type C15tScripts, ConsentManagerProvider } from './consent-providers';
import { CookieBanner } from './cookie-banner';
import { StartVisitOnConsent } from './start-visit-on-consent';

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
      {!isAnalyticsDisabled() && <StartVisitOnConsent />}
      <ConsentManagerDialog />
      <CookieBanner privacyPolicyUrl={privacyPolicyUrl} />
      {children}
    </ConsentManagerProvider>
  );
}
