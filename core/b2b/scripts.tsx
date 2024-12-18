/* eslint-disable @next/next/no-before-interactive-script-outside-document */

import Script from 'next/script';

import { auth } from '~/auth';

import { B2BLogin } from './login';

function B2BProductionScripts() {
  return (
    <>
      <Script id="b2b-config">
        {`
            window.b3CheckoutConfig = {
              routes: {
                dashboard: '/account.php?action=order_status',
              },
            }

            window.B3 = {
              setting: {
                store_hash: '${process.env.BIGCOMMERCE_STORE_HASH}',
                channel_id: ${process.env.BIGCOMMERCE_CHANNEL_ID},
                platform: 'catalyst',
              },
              'dom.checkoutRegisterParentElement': '#checkout-app',
              'dom.registerElement':
              '[href^="/login.php"], #checkout-customer-login, [href="/login.php"] .navUser-item-loginLabel, #checkout-customer-returning .form-legend-container [href="#"]',
              'dom.openB3Checkout': 'checkout-customer-continue',
              before_login_goto_page: '/account.php?action=order_status',
              checkout_super_clear_session: 'true',
              'dom.navUserLoginElement': '.navUser-item.navUser-item--account',
            }
        `}
      </Script>
      <Script
        crossOrigin=""
        src={`${process.env.B2B_BUYER_PORTAL_HOST}/index.*.js`}
        type="module"
      />
      <Script crossOrigin="" src={`${process.env.B2B_BUYER_PORTAL_HOST}/polyfills-legacy.*.js`} />
      <Script crossOrigin="" src={`${process.env.B2B_BUYER_PORTAL_HOST}/index-legacy.*.js`} />
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
              },
            };
        `}
      </Script>
      <Script
        data-channelid="1664810"
        data-storehash="glzvoziq5k"
        src="http://localhost:3001/src/main.ts"
        type="module"
      />
    </>
  );
}

export async function B2BScripts() {
  const session = await auth();
  const b2bToken = session?.b2bToken;

  return (
    <>
      {process.env.NODE_ENV === 'production' ? (
        <B2BProductionScripts />
      ) : (
        <B2BLocalDevelopmentScripts />
      )}
      <B2BLogin b2bToken={b2bToken} />
    </>
  );
}
