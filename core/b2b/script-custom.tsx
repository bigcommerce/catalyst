'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  hostname?: string;
}

export function ScriptCustom({ storeHash, channelId, token, hostname }: Props) {
  useB2BAuth(token);

  return (
    <>
      <Script>
        {`
          window.b3CheckoutConfig = {
              routes: {
              dashboard: '/account',
              },
          }
          window.B3 = {
              setting: {
                store_hash: '${storeHash}',  
                channel_id: ${channelId},
                platform: 'catalyst',
                cart_url: '/cart',
              },
          }
        `}
      </Script>
      <Script
        type="module"
        crossOrigin=""
        src={`${hostname}/index.js`}
      />
      <Script
        noModule
        crossOrigin=""
        src={`${hostname}/polyfills-legacy.js`}
      />
      <Script
        noModule
        crossOrigin=""
        src={`${hostname}/index-legacy.*.js`}
      />
    </>
  );
}
