import { z } from 'zod';

const DEFAULT_API_HOST = 'https://api-b2b.bigcommerce.com';

const ENV = z
  .object({
    env: z.object({
      B2B_API_HOST: z.string().default(DEFAULT_API_HOST),
      NODE_ENV: z.enum(['development', 'production']).default('production'),
    }),
  })
  .transform(({ env }) => env);

export const getAPIHostname = () => {
  const { B2B_API_HOST, NODE_ENV } = ENV.parse(process);

  if (NODE_ENV === 'production') {
    return DEFAULT_API_HOST;
  }

  return B2B_API_HOST;
};
