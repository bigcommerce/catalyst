// A client import must be a build error, not a silent bundling of the GraphQL client and KV.
import 'server-only';

import { createNavigation } from 'next-intl/navigation';

import { getLocaleRouting } from './locale-config';
import { createRouting, LocaleRouting } from './locale-routing';

const createLocaleNavigation = (localeRouting: LocaleRouting) =>
  createNavigation(createRouting(localeRouting));

type LocaleNavigation = ReturnType<typeof createLocaleNavigation>;

// Locale-aware redirects. `async` because subfolders are resolved at runtime; `await` them as you
// would the sync versions — they still never return.
//
// Redirect appends the locale prefix even in the default locale.
// More info: https://github.com/amannn/next-intl/issues/1335
export async function redirect(...args: Parameters<LocaleNavigation['redirect']>): Promise<never> {
  const { redirect: localeRedirect } = createLocaleNavigation(await getLocaleRouting());

  return localeRedirect(...args);
}

export async function permanentRedirect(
  ...args: Parameters<LocaleNavigation['permanentRedirect']>
): Promise<never> {
  const { permanentRedirect: localePermanentRedirect } = createLocaleNavigation(
    await getLocaleRouting(),
  );

  return localePermanentRedirect(...args);
}
