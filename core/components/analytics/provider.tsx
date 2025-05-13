'use client';

import { PropsWithChildren } from 'react';

import { FragmentOf } from '~/client/graphql';
import { Analytics } from '~/lib/analytics';
import { GoogleAnalyticsProvider } from '~/lib/analytics/providers/google-analytics';
import { AnalyticsProvider as AnalyticsProviderLib } from '~/lib/analytics/react';

import { WebAnalyticsFragment } from './fragment';

interface Props {
  channelId: number;
  settings?: FragmentOf<typeof WebAnalyticsFragment> | null;
}

const getAnalytics = (
  channelId: number,
  settings?: FragmentOf<typeof WebAnalyticsFragment> | null,
) => {
  if (settings?.webAnalytics?.ga4?.tagId && channelId) {
    const googleAnalytics = new GoogleAnalyticsProvider({
      gaId: settings.webAnalytics.ga4.tagId,
      // TODO: Need to implement consent mode
      // https://github.com/bigcommerce/catalyst/issues/2066
      consentModeEnabled: false,
      developerId: 'dMjk3Nj',
    });

    return new Analytics({
      channelId,
      providers: [googleAnalytics],
    });
  }

  return null;
};

export function AnalyticsProvider({ children, settings, channelId }: PropsWithChildren<Props>) {
  const analytics = getAnalytics(channelId, settings);

  return <AnalyticsProviderLib analytics={analytics ?? null}>{children}</AnalyticsProviderLib>;
}
