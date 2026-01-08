import { z } from 'zod';

import { auth } from '~/auth';

import { ScriptDev } from './script-dev';
import { ScriptProduction } from './script-production';
import { ScriptProductionCustom } from './script-production-custom';

const EnvironmentSchema = z.object({
  BIGCOMMERCE_STORE_HASH: z.string({ message: 'BIGCOMMERCE_STORE_HASH is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
  LOCAL_BUYER_PORTAL_HOST: z.string().url().optional(),
  PROD_BUYER_PORTAL_URL: z.string().url().optional(),
  STAGING_B2B_CDN_ORIGIN: z.string().optional(),
  PROD_BUYER_PORTAL_HASH_INDEX: z.string().optional(),
  PROD_BUYER_PORTAL_HASH_INDEX_LEGACY: z.string().optional(),
  PROD_BUYER_PORTAL_HASH_POLYFILLS: z.string().optional(),
});

export async function B2BLoader() {
  const {
    BIGCOMMERCE_STORE_HASH,
    BIGCOMMERCE_CHANNEL_ID,
    LOCAL_BUYER_PORTAL_HOST,
    PROD_BUYER_PORTAL_URL,
    STAGING_B2B_CDN_ORIGIN,
    PROD_BUYER_PORTAL_HASH_INDEX,
    PROD_BUYER_PORTAL_HASH_INDEX_LEGACY,
    PROD_BUYER_PORTAL_HASH_POLYFILLS,
  } = EnvironmentSchema.parse(process.env);

  const session = await auth();

  if (LOCAL_BUYER_PORTAL_HOST) {
    return (
      <ScriptDev
        cartId={session?.user?.cartId ?? undefined}
        channelId={BIGCOMMERCE_CHANNEL_ID}
        hostname={LOCAL_BUYER_PORTAL_HOST}
        storeHash={BIGCOMMERCE_STORE_HASH}
        token={session?.b2bToken}
      />
    );
  }
  
  if (PROD_BUYER_PORTAL_URL) {
    return (
      <ScriptProductionCustom
        cartId={session?.user?.cartId}
        channelId={BIGCOMMERCE_CHANNEL_ID}
        storeHash={BIGCOMMERCE_STORE_HASH}
        token={session?.b2bToken}
        prodUrl={PROD_BUYER_PORTAL_URL}
        hashIndex={PROD_BUYER_PORTAL_HASH_INDEX}
        hashIndexLegacy={PROD_BUYER_PORTAL_HASH_INDEX_LEGACY}
        hashPolyfills={PROD_BUYER_PORTAL_HASH_POLYFILLS}
      />
    );
  }

  const environment = STAGING_B2B_CDN_ORIGIN === 'true' ? 'staging' : 'production';

  return (
    <ScriptProduction
      cartId={session?.user?.cartId}
      channelId={BIGCOMMERCE_CHANNEL_ID}
      environment={environment}
      storeHash={BIGCOMMERCE_STORE_HASH}
      token={session?.b2bToken}
    />
  );
}
