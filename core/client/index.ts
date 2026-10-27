import { BigCommerceAuthError, createClient } from '@bigcommerce/catalyst-client';

import { getCurrentChannelId } from '../lib/channel';
import { backendUserAgent } from '../user-agent';

import { beforeRequest } from './before-request';

// next/headers, next/navigation, and next-intl/server are imported dynamically
// (via `import()`) rather than statically. Static imports cause these modules to
// be evaluated during module graph resolution when next.config.ts imports this
// file, which poisons the process-wide AsyncLocalStorage context (pnpm symlinks
// create two separate singleton instances of next/headers). Dynamic imports
// defer module loading to call time, after Next.js has fully initialized.
//
// During config resolution, the dynamic import of next-intl/server succeeds but
// getLocale() throws ("not supported in Client Components") — the try/catch in
// `./before-request` absorbs this gracefully. The channel itself is resolved by
// getCurrentChannelId(), which falls back to the default channel.

export const client = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: (defaultChannelId: string) => getCurrentChannelId(defaultChannelId),
  beforeRequest,
  onError: async (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      const { redirect } = await import('next/navigation');

      redirect('/api/auth/signout');
    }
  },
});
