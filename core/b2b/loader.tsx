import { auth } from '~/auth';

import { ScriptDev } from './script-dev';
import { ScriptProduction } from './script-production';

export async function B2BLoader() {
  const session = await auth();
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;
  const localBuyerPortalHost = process.env.LOCAL_BUYER_PORTAL_HOST;

  if (!storeHash || !channelId) {
    throw new Error('BIGCOMMERCE_STORE_HASH or BIGCOMMERCE_CHANNEL_ID is not set');
  }

  if (localBuyerPortalHost) {
    return (
      <ScriptDev
        channelId={channelId}
        hostname={localBuyerPortalHost}
        storeHash={storeHash}
        token={session?.b2bToken}
      />
    );
  }

  const environment = process.env.STAGING_B2B_CDN_ORIGIN === 'true' ? 'staging' : 'production';

  return (
    <ScriptProduction
      channelId={channelId}
      environment={environment}
      storeHash={storeHash}
      token={session?.b2bToken}
    />
  );
}
