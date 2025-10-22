import { z } from 'zod';

import { auth } from '~/auth';

import { ScriptDev } from './script-dev';
import { ScriptProduction } from './script-production';

const EnvironmentSchema = z.object({
  BIGCOMMERCE_STORE_HASH: z.string({ message: 'BIGCOMMERCE_STORE_HASH is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
  LOCAL_BUYER_PORTAL_HOST: z.string().url().optional(),
  BUYER_PORTAL_ENVIRONMENT: z.enum(['production', 'staging', 'integration']).optional().default('production'),
});

export async function B2BLoader() {
  const {
    BIGCOMMERCE_STORE_HASH,
    BIGCOMMERCE_CHANNEL_ID,
    LOCAL_BUYER_PORTAL_HOST,
    BUYER_PORTAL_ENVIRONMENT,
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

  return (
    <ScriptProduction
      cartId={session?.user?.cartId}
      channelId={BIGCOMMERCE_CHANNEL_ID}
      environment={BUYER_PORTAL_ENVIRONMENT}
      storeHash={BIGCOMMERCE_STORE_HASH}
      token={session?.b2bToken}
    />
  );
}
