import { getChannelIdFromLocale } from '../channels.config';

// `next-intl/server` is imported dynamically. `next.config.ts` imports `~/client`, which imports
// this module, and a static import would be evaluated during config resolution — before Next.js
// has set up its request context. See the note in `~/client/index.ts`.
const getRequestLocale = async (): Promise<string | undefined> => {
  try {
    const { getLocale } = await import('next-intl/server');

    return await getLocale();
  } catch {
    // `getLocale` throws when there is no request locale: config resolution, the proxy,
    // `generateStaticParams`, route handlers, and static rendering without `setRequestLocale`.
    // Callers then fall through to the default channel.
  }
};

/**
 * Channel for the current request, resolved the same way Storefront GraphQL requests are.
 *
 * A locale listed in `~/channels.config` selects that channel. Every other locale, and any
 * request that has no locale, uses `BIGCOMMERCE_CHANNEL_ID`. `fallbackChannelId` applies only
 * when that variable is unset.
 *
 * @param {string} [fallbackChannelId] - Channel to use when neither the locale nor the
 *   environment variable resolves one.
 * @returns {Promise<string | undefined>} The channel id, or `undefined` when nothing resolves one.
 */
export async function getCurrentChannelId(fallbackChannelId: string): Promise<string>;
export async function getCurrentChannelId(fallbackChannelId?: string): Promise<string | undefined>;

export async function getCurrentChannelId(fallbackChannelId?: string): Promise<string | undefined> {
  const locale = await getRequestLocale();

  return getChannelIdFromLocale(locale) ?? fallbackChannelId;
}
