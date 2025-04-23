import { z } from 'zod';

import { auth } from '~/auth';

import { ScriptDev } from './script-dev';
import { ScriptProduction } from './script-production';
import { ScriptCustom } from './script-custom';

const EnvironmentSchema = z.object({
  BIGCOMMERCE_STORE_HASH: z.string({ message: 'BIGCOMMERCE_STORE_HASH is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
  LOCAL_BUYER_PORTAL_HOST: z.string().url().optional(),
  STAGING_B2B_CDN_ORIGIN: z.string().optional(),
  CUSTOM_BUYER_PORTAL_HOST: z.string().url().optional(),
});

export async function B2BLoader() {
  const {
    BIGCOMMERCE_STORE_HASH,
    BIGCOMMERCE_CHANNEL_ID,
    LOCAL_BUYER_PORTAL_HOST,
    STAGING_B2B_CDN_ORIGIN,
    CUSTOM_BUYER_PORTAL_HOST,
  } = EnvironmentSchema.parse(process.env);

  const session = await auth();

  if (LOCAL_BUYER_PORTAL_HOST) {
    return (
      <ScriptDev
        channelId={BIGCOMMERCE_CHANNEL_ID}
        hostname={LOCAL_BUYER_PORTAL_HOST}
        storeHash={BIGCOMMERCE_STORE_HASH}
        token={session?.b2bToken}
      />
    );
  }

  if (CUSTOM_BUYER_PORTAL_HOST) {
    <ScriptCustom
      channelId={BIGCOMMERCE_CHANNEL_ID}
      hostname={CUSTOM_BUYER_PORTAL_HOST}
      storeHash={BIGCOMMERCE_STORE_HASH}
      token={session?.b2bToken}
    />;
  }


  const environment = STAGING_B2B_CDN_ORIGIN === 'true' ? 'staging' : 'production';
  return (
    <ScriptProduction
      channelId={BIGCOMMERCE_CHANNEL_ID}
      environment={environment}
      storeHash={BIGCOMMERCE_STORE_HASH}
      token={session?.b2bToken}
    />
  );
}
