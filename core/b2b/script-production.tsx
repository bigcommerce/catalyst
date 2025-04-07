'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment: 'staging' | 'production';
}

export function ScriptProduction({ storeHash, channelId, token, environment }: Props) {
  useB2BAuth(token);

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
