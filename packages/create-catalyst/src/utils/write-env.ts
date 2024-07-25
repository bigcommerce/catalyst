import { randomBytes } from 'crypto';
import { outputFileSync } from 'fs-extra/esm';
import { join } from 'path';

export const writeEnv = (
  projectDir: string,
  {
    channelId,
    storeHash,
    accessToken,
    customerImpersonationToken,
    storefrontToken,
  }: {
    channelId: string;
    storeHash: string;
    accessToken: string;
    customerImpersonationToken: string;
    storefrontToken?: string;
  },
) => {
  /**
   * @todo silence request logs by default
   */
  outputFileSync(
    join(projectDir, '.env.local'),
    [
      `AUTH_SECRET=${randomBytes(32).toString('hex')}`,
      `BIGCOMMERCE_STORE_HASH=${storeHash}`,
      `BIGCOMMERCE_CHANNEL_ID=${channelId}`,
      `BIGCOMMERCE_ACCESS_TOKEN=${accessToken}`,
      `BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN=${customerImpersonationToken}`,
      `BIGCOMMERCE_STOREFRONT_TOKEN=${storefrontToken}`,
      `CLIENT_LOGGER=false`,
      `ENABLE_ADMIN_ROUTE=true`,
      `NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET=3600`,
    ].join('\n'),
  );
};
