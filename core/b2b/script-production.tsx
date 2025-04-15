'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment: 'staging' | 'production';
  cartId?: string | null;
}

export function ScriptProduction({ cartId, storeHash, channelId, token, environment }: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

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
        src={`https://cdn.bundleb2b.net/b2b/${environment}/storefront/headless.js`}
        type="module"
      />
    </>
  );
}
