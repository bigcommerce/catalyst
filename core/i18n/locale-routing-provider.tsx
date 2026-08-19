'use client';

import { createNavigation } from 'next-intl/navigation';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { createRouting, LocaleRouting } from './locale-routing';

const createLocaleNavigation = (localeRouting: LocaleRouting) =>
  createNavigation(createRouting(localeRouting));

export type LocaleNavigation = ReturnType<typeof createLocaleNavigation>;

// `createNavigation` hands back fresh component and hook identities on every call, so results are
// memoized on the *content* of the configuration rather than its object identity. A new identity
// carrying the same config (a fresh server payload, say) therefore reuses the same `Link` component
// type, instead of remounting every link's subtree.
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

// There is no build-time locale configuration to default to, so consumers must be inside the
// provider. Every client component that navigates renders under `app/[locale]/layout.tsx`.
const LocaleNavigationContext = createContext<LocaleNavigation | null>(null);

interface Props {
  localeRouting: LocaleRouting;
}

// Makes the merchant's runtime locale routing available to client components.
//
// Rendered by `app/[locale]/layout.tsx` so that `Link`, `useRouter` and `usePathname` build URLs
// from the same configuration the proxy used to resolve the request. The navigation is resolved
// here, once per render pass, rather than in each of the (potentially hundreds of) consumers.
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
