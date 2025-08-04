// ./getAPIHostname.ts

import { z } from 'zod';
import chalk from 'chalk';

const DEFAULT_API_HOST = 'https://api.example.com';

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
  const b2bApiHost = NODE_ENV === 'production' ? DEFAULT_API_HOST : B2B_API_HOST;

  if (b2bApiHost && b2bApiHost.endsWith('/') && NODE_ENV !== 'production') {
    console.log(chalk.red('==================== ATTENTION ===================='));
    console.log(
      chalk.red(
        `Warning: The B2B_API_HOST environment variable ("${b2bApiHost}") ends with a trailing slash '/'.`,
      ),
    );
    console.log(
      chalk.red(
        `This can lead to double slashes in API URLs. Please remove it from your .env file.`,
      ),
    );
    console.log(chalk.red('================================================='));

    throw new Error(
      `B2B_API_HOST should not end with a trailing slash. Please update your .env file.`,
    );
  }

  return b2bApiHost;
};
