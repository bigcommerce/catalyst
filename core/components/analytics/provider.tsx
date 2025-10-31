'use client';

import { useConsentManager } from '@c15t/nextjs';
import { PropsWithChildren, useEffect, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { Analytics } from '~/lib/analytics';
import { GoogleAnalyticsProvider } from '~/lib/analytics/providers/google-analytics';
import { AnalyticsProvider as AnalyticsProviderLib } from '~/lib/analytics/react';
import { getConsentCookie } from '~/lib/consent-manager/cookies/client';

import { WebAnalyticsFragment } from './fragment';

interface Props {
  channelId: number;
  isCookieConsentEnabled: boolean;
  settings?: FragmentOf<typeof WebAnalyticsFragment> | null;
}

const getConsent = () => {
  const consentCookie = getConsentCookie();

  if (!consentCookie) {
    return null;
  }

  return {
    functionality: consentCookie.preferences.functionality ?? false,
    marketing: consentCookie.preferences.marketing ?? false,
    measurement: consentCookie.preferences.measurement ?? false,
    necessary: consentCookie.preferences.necessary ?? false,
  };
};

const getAnalytics = ({ channelId, isCookieConsentEnabled, settings }: Props): Analytics | null => {
  if (settings?.webAnalytics?.ga4?.tagId && channelId) {
    const googleAnalytics = new GoogleAnalyticsProvider({
      gaId: settings.webAnalytics.ga4.tagId,
      consentModeEnabled: isCookieConsentEnabled,
      developerId: 'dMjk3Nj',
      getConsent,
    });

    return new Analytics({
      channelId,
      providers: [googleAnalytics],
    });
  }

  return null;
};

export function AnalyticsProvider({
  channelId,
  isCookieConsentEnabled,
  settings,
  children,
}: PropsWithChildren<Props>) {
  const { consents } = useConsentManager();
  const prevConsentsRef = useRef<Record<string, boolean> | null>(null);

  const analytics = getAnalytics({
    channelId,
    isCookieConsentEnabled,
    settings,
  });

  // Update consent when user changes preferences
  useEffect(() => {
    if (!isCookieConsentEnabled || !analytics) {
      return;
    }

    const currentConsents = consents;
    const prevConsents = prevConsentsRef.current;

    // Check if consents have changed
    if (prevConsents && JSON.stringify(currentConsents) !== JSON.stringify(prevConsents)) {
      const consentState = getConsent();

      if (consentState) {
        analytics.consent.consentUpdated(consentState);
      }
    }

    prevConsentsRef.current = currentConsents;
  }, [isCookieConsentEnabled, analytics, consents]);

  return <AnalyticsProviderLib analytics={analytics ?? null}>{children}</AnalyticsProviderLib>;
}
