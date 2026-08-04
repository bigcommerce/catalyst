'use client';

import { B2BClientEffects } from './b2b-client-effects';
import { B2BDevScriptInjector } from './b2b-dev-script-injector';

interface DevProps {
  storeHash: string;
  channelId: string;
  hostname: string;
  token?: string;
  cartId?: string;
  bcGraphqlDomain?: string;
}

export function ScriptDev({
  cartId,
  hostname,
  storeHash,
  channelId,
  token,
  bcGraphqlDomain,
}: DevProps) {
  return (
    <>
      <B2BClientEffects cartId={cartId} token={token} />
      <B2BDevScriptInjector
        bcGraphqlDomain={bcGraphqlDomain}
        channelId={channelId}
        hostname={hostname}
        storeHash={storeHash}
      />
    </>
  );
}
