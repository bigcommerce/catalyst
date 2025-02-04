/* eslint-disable @next/next/no-before-interactive-script-outside-document */
'use client';

import Script from 'next/script';
import { Session } from 'next-auth';

import { useB2BAuth } from './use-b2b-auth';

export function B2BProductionScripts({
  storeHash,
  channelId,
  session,
  localBuyerPortalHost,
}: {
  storeHash: string;
  channelId: string;
  session: Session | null;
  localBuyerPortalHost?: string;
}) {
  useB2BAuth(session);

  if (localBuyerPortalHost) {
    return (
      <>
        <Script id="b2b-react-refresh" strategy="beforeInteractive" type="module">
          {`
              import RefreshRuntime from '${localBuyerPortalHost}/@react-refresh'
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
          `}
        </Script>
        <Script
          id="b2b-vite-client"
          src={`${localBuyerPortalHost}/@vite/client`}
          strategy="beforeInteractive"
          type="module"
        />

        <Script id="b2b-config">
          {`
              window.B3 = {
                setting: {
                  store_hash: '${process.env.BIGCOMMERCE_STORE_HASH}',
                  channel_id: ${process.env.BIGCOMMERCE_CHANNEL_ID},
                  platform: 'catalyst',
                  cart_url: '/cart',
                  disable_logout_button: true,
                },
              };
          `}
        </Script>
        <Script
          data-channelid={process.env.BIGCOMMERCE_CHANNEL_ID}
          data-storehash={process.env.BIGCOMMERCE_STORE_HASH}
          src={`${localBuyerPortalHost}/src/main.ts`}
          type="module"
        />
      </>
    );
  }

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
        data-storehash={storeHash}
        src="https://cdn.bundleb2b.net/b2b/production/storefront/headless.js"
        type="module"
      />
    </>
  );
}
