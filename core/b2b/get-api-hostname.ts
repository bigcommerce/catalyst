import { z } from 'zod';

const DEFAULT_API_HOST = 'https://api-b2b.bigcommerce.com';

/**
 * B2B API hosts a storefront is allowed to talk to.
 *
 * Production builds only honour `B2B_API_HOST` when it names one of these, so a
 * misconfigured storefront can never send customer access tokens to an arbitrary
 * origin. Keeping the internal environments here is what makes it possible to run
 * a production build against a non-production store (CI / functional tests).
 */
const ALLOWED_API_HOSTS = new Set([
  DEFAULT_API_HOST,
  'https://api-b2b.staging.zone',
  'https://api-b2b.integration.zone',
  'https://api-b2b.service.bcdev',
]);

const ENV = z
  .object({
    env: z.object({
      B2B_API_HOST: z.string().default(DEFAULT_API_HOST),
      NODE_ENV: z.enum(['development', 'production']).default('production'),
    }),
  })
  .transform(({ env }) => env);

const stripTrailingSlashes = (host: string) => host.replace(/\/+$/, '');

export const getAPIHostname = () => {
  const { B2B_API_HOST, NODE_ENV } = ENV.parse(process);
  const apiHost = stripTrailingSlashes(B2B_API_HOST);

  // Local development may point at a B2B API running anywhere, including localhost.
  if (NODE_ENV !== 'production') {
    return apiHost;
  }

  if (ALLOWED_API_HOSTS.has(apiHost)) {
    return apiHost;
  }

  if (apiHost !== DEFAULT_API_HOST) {
    // eslint-disable-next-line no-console
    console.warn(
      `Ignoring B2B_API_HOST "${apiHost}": not a recognised BigCommerce B2B API host. Falling back to ${DEFAULT_API_HOST}.`,
    );
  }

  return DEFAULT_API_HOST;
};
