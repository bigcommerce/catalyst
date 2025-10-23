'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment: 'staging' | 'production' | 'integration';
  cartId?: string | null;
}

const CDN_BY_ENV: Record<Props['environment'], string> = {
  production: 'https://microapps.bigcommerce.com',
  staging: 'https://microapps.staging.zone',
  integration: 'https://microapps.integration.zone',
};

export function ScriptProduction({ cartId, storeHash, channelId, token, environment }: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

  const src = `${CDN_BY_ENV[environment]}/b2b-buyer-portal/headless.js`;

  return (
    <>
      <Script id="b2b-config">
        {`
            window.B3 = {
              setting: {
                store_hash: '${storeHash}',
                channel_id: ${channelId},
                platform: 'catalyst',
                cart_url: '/cart',
              }
            }
        `}
      </Script>
      <Script
        data-channelid={channelId}
        data-environment={environment}
        data-storehash={storeHash}
        src={src}
        type="module"
      />
    </>
  );
}
