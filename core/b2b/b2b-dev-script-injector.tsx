'use client';

import { useEffect } from 'react';

interface Props {
  storeHash: string;
  channelId: string;
  hostname: string;
  bcGraphqlDomain?: string;
}

export function B2BDevScriptInjector({ bcGraphqlDomain, channelId, hostname, storeHash }: Props) {
  useEffect(() => {
    if (document.getElementById('b2b-vite-entry')) {
      return;
    }

    const mainSrc = `${hostname}/src/main.ts`;
    const graphqlDomain = bcGraphqlDomain ?? 'mybigcommerce.com';

    // Classic script so B3 config is available before the Vite modules evaluate.
    const configScript = document.createElement('script');

    configScript.id = 'b2b-config';
    configScript.textContent = `
      window.B3 = {
        setting: {
          store_hash: '${storeHash}',
          channel_id: ${channelId},
          platform: 'catalyst',
          cart_url: '/cart',
          bc_graphql_domain: '${graphqlDomain}',
        },
      };
    `;
    document.head.appendChild(configScript);

    // React 19 does not execute <script> tags rendered from client components.
    // Inject a single module that installs the Vite React preamble first, then
    // loads the client and buyer-portal entry in order.
    const entryScript = document.createElement('script');

    entryScript.id = 'b2b-vite-entry';
    entryScript.type = 'module';
    entryScript.textContent = `
      import RefreshRuntime from '${hostname}/@react-refresh';
      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => (type) => type;
      window.__vite_plugin_react_preamble_installed__ = true;

      await import('${hostname}/@vite/client');
      await import('${mainSrc}');
    `;
    document.head.appendChild(entryScript);
  }, [bcGraphqlDomain, channelId, hostname, storeHash]);

  return null;
}
