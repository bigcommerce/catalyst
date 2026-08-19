// Importing this from a client component must be a build error, not a silent bundling of the
// GraphQL client and KV adapters into the browser.
import 'server-only';

import { createNavigation } from 'next-intl/navigation';

import { getLocaleRouting } from './locale-config';
import { createRouting, LocaleRouting } from './locale-routing';

const createLocaleNavigation = (localeRouting: LocaleRouting) =>
  createNavigation(createRouting(localeRouting));

type LocaleNavigation = ReturnType<typeof createLocaleNavigation>;

// Server-side redirects that respect the merchant's runtime locale subfolders.
//
// These are `async` because the subfolder configuration is fetched at runtime rather than baked in
// at build time. `await` them as you would the synchronous versions — they still never return.
//
// Kept out of `~/i18n/routing` so that resolving the runtime config (and with it `~/client` and
// `~/lib/kv`) never reaches the client bundle.
//
// Redirect will append the locale prefix even when in the default locale.
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
