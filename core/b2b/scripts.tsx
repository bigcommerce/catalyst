/* eslint-disable @next/next/no-before-interactive-script-outside-document */

import Script from 'next/script';

import { auth } from '~/auth';

import { B2BLogin } from './login';

function B2BProductionScripts() {
  return (
    <>
      <Script id="b2b-config">
        {`
            window.B3 = {
              setting: {
                store_hash: '${process.env.BIGCOMMERCE_STORE_HASH}',
                channel_id: ${process.env.BIGCOMMERCE_CHANNEL_ID},
                platform: 'catalyst',
                cart_url: '/cart',
              }
            }
        `}
      </Script>
      <Script
        data-channelid={process.env.BIGCOMMERCE_CHANNEL_ID}
        data-storehash={process.env.BIGCOMMERCE_STORE_HASH}
        src="https://cdn.bundleb2b.net/b2b/production/storefront/headless.js"
        type="module"
      />
    </>
  );
}

function B2BLocalDevelopmentScripts() {
  return (
    <>
      <Script id="b2b-react-refresh" strategy="beforeInteractive" type="module">
        {`
            import RefreshRuntime from 'http://localhost:3001/@react-refresh'
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
        `}
      </Script>
      <Script
        id="b2b-vite-client"
        src="http://localhost:3001/@vite/client"
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
              },
            };
        `}
      </Script>
      <Script
        data-channelid={process.env.BIGCOMMERCE_CHANNEL_ID}
        data-storehash={process.env.BIGCOMMERCE_STORE_HASH}
        src="http://localhost:3001/src/main.ts"
        type="module"
      />
    </>
  );
}

export async function B2BScripts() {
  const session = await auth();
  const b2bToken = session?.b2bToken;

  // Uncomment this to use local development scripts
  // if (process.env.NODE_ENV !== 'production') {
  //   return (
  //     <>
  //       <B2BLocalDevelopmentScripts />
  //       <B2BLogin b2bToken={b2bToken} />
  //     </>
  //   );
  // }

  return (
    <>
      <B2BProductionScripts />
      <B2BLogin b2bToken={b2bToken} />
    </>
  );
}
