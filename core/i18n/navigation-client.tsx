'use client';

import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { LocaleNavigation, useLocaleNavigation } from './locale-routing-provider';

type NavLinkProps = ComponentPropsWithoutRef<LocaleNavigation['Link']>;

/**
 * next-intl's `Link`, bound to the merchant's runtime locale routing.
 *
 * Prefer `~/components/link`, which adds prefetching controls on top of this.
 */
export const Link = forwardRef<HTMLAnchorElement, NavLinkProps>((props, ref) => {
  const { Link: NavLink } = useLocaleNavigation();

  return <NavLink ref={ref} {...props} />;
});

Link.displayName = 'Link';

export const usePathname = () => useLocaleNavigation().usePathname();

// next-intl's `useRouter`, bound to the merchant's runtime locale routing.
//
// Delegates to next-intl rather than reimplementing `push`/`replace` on purpose: its wrappers are
// what keep the `NEXT_LOCALE` cookie in sync when a shopper switches locale, which is how an
// explicit language choice survives `Accept-Language` detection on later requests.
export const useRouter = () => useLocaleNavigation().useRouter();
