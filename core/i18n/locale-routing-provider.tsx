'use client';

import { createNavigation } from 'next-intl/navigation';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { createRouting, LocaleRouting } from './locale-routing';

const createLocaleNavigation = (localeRouting: LocaleRouting) =>
  createNavigation(createRouting(localeRouting));

export type LocaleNavigation = ReturnType<typeof createLocaleNavigation>;

// Memoized on config *content*, not object identity: `createNavigation` returns fresh component
// identities each call, so a new payload with the same config would otherwise remount every link.
const navigationCache = new Map<string, LocaleNavigation>();

const getLocaleNavigation = (localeRouting: LocaleRouting): LocaleNavigation => {
  const cacheKey = JSON.stringify([
    localeRouting.locales,
    localeRouting.defaultLocale,
    localeRouting.prefixes,
    localeRouting.rootLocale,
  ]);

  const cached = navigationCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const navigation = createLocaleNavigation(localeRouting);

  navigationCache.set(cacheKey, navigation);

  return navigation;
};

// No build-time config to default to, so consumers must be inside the provider.
const LocaleNavigationContext = createContext<LocaleNavigation | null>(null);

interface Props {
  localeRouting: LocaleRouting;
}

// Rendered by `app/[locale]/layout.tsx` so client navigation builds URLs from the same config the
// proxy resolved. Resolved here once per render pass, not in each of many consumers.
export const LocaleRoutingProvider = ({ localeRouting, children }: PropsWithChildren<Props>) => {
  const navigation = useMemo(() => getLocaleNavigation(localeRouting), [localeRouting]);

  return (
    <LocaleNavigationContext.Provider value={navigation}>
      {children}
    </LocaleNavigationContext.Provider>
  );
};

export const useLocaleNavigation = () => {
  const context = useContext(LocaleNavigationContext);

  if (!context) {
    throw new Error('useLocaleNavigation must be used within a LocaleRoutingProvider');
  }

  return context;
};
