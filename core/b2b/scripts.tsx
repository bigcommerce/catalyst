/* eslint-disable @next/next/no-before-interactive-script-outside-document */
'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment: 'staging' | 'production';
}

export function B2BProductionScripts({ storeHash, channelId, token, environment }: Props) {
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
        data-storehash={storeHash}
        data-environment={environment}
        src={`https://cdn.bundleb2b.net/b2b/${environment}/storefront/headless.js`}
        type="module"
      />
    </>
  );
}

interface DevProps {
  storeHash: string;
  channelId: string;
  hostname: string;
  token?: string;
}

export function B2BDevScripts({ hostname, storeHash, channelId, token }: DevProps) {
  useB2BAuth(token);

  const src = `${hostname}/src/main.ts`;

  return (
    <>
      <Script id="b2b-react-refresh" strategy="beforeInteractive" type="module">
        {`
              import RefreshRuntime from '${hostname}/@react-refresh'
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
          `}
      </Script>
      <Script
        id="b2b-vite-client"
        src={`${hostname}/@vite/client`}
        strategy="beforeInteractive"
        type="module"
      />

      <Script id="b2b-config">
        {`
              window.B3 = {
                setting: {
                  store_hash: '${storeHash}',
                  channel_id: ${channelId},
                  platform: 'catalyst',
                  cart_url: '/cart',
                },
              };
          `}
      </Script>
      <Script data-channelid={storeHash} data-storehash={channelId} src={src} type="module" />
    </>
  );
}
