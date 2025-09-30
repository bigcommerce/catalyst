'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  cartId?: string | null;
  prodUrl: string;
  hashIndex?: string;
  hashIndexLegacy?: string;
  hashPolyfills?: string;
}

export function ScriptProductionCustom({ 
  cartId, 
  storeHash, 
  channelId, 
  token,
  prodUrl,
  hashIndex,
  hashIndexLegacy,
  hashPolyfills,
}: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

  return (
    <>
      <Script>
        {`
        window.b3CheckoutConfig = {
          routes: {
            dashboard: '/#/dashboard',
          },
        }
        window.B3 = {
          setting: {
            store_hash: '${storeHash}',  
            channel_id: ${channelId},
          },
        }
        `}
      </Script>
      <Script
        type="module"
        crossOrigin=""
        src={`${prodUrl}/index${hashIndex ? `.${hashIndex}` : ''}.js`}
      ></Script>
      <Script
        noModule
        crossOrigin=""
        src={`${prodUrl}/polyfills-legacy${hashPolyfills ? `.${hashPolyfills}` : ''}.js`}
      ></Script>
      <Script
        noModule
        crossOrigin=""
        src={`${prodUrl}/index-legacy${hashIndexLegacy ? `.${hashIndexLegacy}` : ''}.js`}
      ></Script>
    </>
  );
}
