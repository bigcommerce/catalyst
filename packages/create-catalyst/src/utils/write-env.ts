import { randomBytes } from 'crypto';
import { outputFileSync } from 'fs-extra/esm';
import { join } from 'path';

export const writeEnv = (
  projectDir: string,
  {
    channelId,
    storeHash,
    storefrontToken,
    arbitraryEnv,
  }: {
    channelId: string;
    storeHash: string;
    storefrontToken?: string;
    arbitraryEnv?: string[];
  },
) => {
  outputFileSync(
    join(projectDir, '.env.local'),
    [
      `BIGCOMMERCE_STORE_HASH=${storeHash}`,
      `BIGCOMMERCE_CHANNEL_ID=${channelId}`,
      `BIGCOMMERCE_STOREFRONT_TOKEN=${storefrontToken}`,
      '',
      `AUTH_SECRET=${randomBytes(32).toString('hex')}`,
      `CLIENT_LOGGER=false`,
      `ENABLE_ADMIN_ROUTE=true`,
      `DEFAULT_REVALIDATE_TARGET=3600`,
      arbitraryEnv?.map((env) => env).join('\n'),
    ].join('\n'),
  );
};
