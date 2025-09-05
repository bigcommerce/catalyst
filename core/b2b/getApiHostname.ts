import { z } from 'zod';

const DEFAULT_API_HOST = 'https://api-b2b.bigcommerce.com';

const ENV = z
  .object({
    env: z.object({
      B2B_API_HOST: z.string().default(DEFAULT_API_HOST),
      NODE_ENV: z.enum(['development', 'production']).default('production'),
      STAGING_B2B_CDN_ORIGIN: z.string().optional(),
    }),
  })
  .transform(({ env }) => env);

export const getAPIHostname = () => {
  const { B2B_API_HOST, NODE_ENV, STAGING_B2B_CDN_ORIGIN } = ENV.parse(process);

  if (STAGING_B2B_CDN_ORIGIN === "true") {
    return 'https://api-b2b.staging.zone';
  }

  if (NODE_ENV === 'production') {
    return DEFAULT_API_HOST;
  }

  return B2B_API_HOST;
};
