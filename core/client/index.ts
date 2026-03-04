import { BigCommerceAuthError, createClient } from '@bigcommerce/catalyst-client';

import { getChannelIdFromLocale } from '../channels.config';
import { backendUserAgent } from '../user-agent';

// next/headers, next/navigation, and next-intl/server are imported dynamically
// (via `import()`) rather than statically. Static imports cause these modules to
// be evaluated during module graph resolution when next.config.ts imports this
// file, which poisons the process-wide AsyncLocalStorage context (pnpm symlinks
// create two separate singleton instances of next/headers). Dynamic imports
// defer module loading to call time, after Next.js has fully initialized.
//
// During config resolution, the dynamic import of next-intl/server succeeds but
// getLocale() throws ("not supported in Client Components") — the try/catch
// below absorbs this gracefully, and getChannelId falls back to defaultChannelId.
import { getCorrelationId } from './correlation-id';

export const client = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: (defaultChannelId: string, locale?: string) => {
    return getChannelIdFromLocale(locale) ?? defaultChannelId;
  },
  beforeRequest: async (fetchOptions) => {
    // We can't serialize a `Headers` object within this method so we have to opt into using a plain object
    const requestHeaders: Record<string, string> = {};

    if (fetchOptions?.cache && ['no-store', 'no-cache'].includes(fetchOptions.cache)) {
      const { headers } = await import('next/headers');
      const ipAddress = (await headers()).get('X-Forwarded-For');

      if (ipAddress) {
        requestHeaders['X-Forwarded-For'] = ipAddress;
        requestHeaders['True-Client-IP'] = ipAddress;
      }
    }

    requestHeaders['X-Correlation-ID'] = getCorrelationId();

    return {
      headers: requestHeaders,
    };
  },
  onError: async (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      const { redirect } = await import('next/navigation');

      redirect('/api/auth/signout');
    }
  },
});
