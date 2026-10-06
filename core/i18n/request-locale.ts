import 'server-only';

import { NextRequest } from 'next/server';

import { getCachedLocaleRouting } from './locale-config';
import { getLocaleFromPathname } from './locale-routing';

function getRefererPathname(request: NextRequest) {
  const referer = request.headers.get('referer');

  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).pathname;
  } catch {
    return null;
  }
}

/**
 * Resolves the locale an API route should act on. An explicit `locale` query param wins, then
 * the referring page's pathname, then the configured defaults.
 *
 * @param {NextRequest} request - The incoming API route request.
 * @returns {Promise<string>} The locale whose channel this request's data should be scoped to.
 */
export async function getLocaleFromRequest(request: NextRequest): Promise<string> {
  const localeRouting = await getCachedLocaleRouting();
  const queryLocale = request.nextUrl.searchParams.get('locale');
  const refererPathname = getRefererPathname(request);

  return (
    (queryLocale && localeRouting.locales.includes(queryLocale) ? queryLocale : null) ??
    (refererPathname ? getLocaleFromPathname(localeRouting, refererPathname) : null) ??
    localeRouting.rootLocale ??
    localeRouting.defaultLocale
  );
}
