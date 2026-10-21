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
  const analyticsDisabled = isAnalyticsDisabled();

  return (
    <ConsentManagerProvider
      isCookieConsentEnabled={isCookieConsentEnabled}
      // Script Manager scripts in the Analytics category map to `measurement`.
      scripts={
        analyticsDisabled ? scripts.filter((script) => script.category !== 'measurement') : scripts
      }
    >
      {!analyticsDisabled && <StartVisitOnConsent />}
      <ConsentManagerDialog />
      <CookieBanner privacyPolicyUrl={privacyPolicyUrl} />
      {children}
    </ConsentManagerProvider>
  );
}
