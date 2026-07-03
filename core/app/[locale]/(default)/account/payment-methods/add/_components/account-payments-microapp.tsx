'use client';

import { useEffect, useRef, useState } from 'react';

import { type MicroappAssets, type MicroappCountry } from '../page-data';

interface RenderConfig {
  styles: Record<string, unknown>;
  errorHandler: (message: string) => void;
  storeContextData: Record<string, unknown>;
}

declare global {
  interface Window {
    BigCommerce?: {
      renderAccountPayments?: (config: RenderConfig) => void;
    };
  }
}

// Loads the storefront-account-payments microapp bundle from the CDN and calls
// renderAccountPayments for a single provider.
//
// POC scope: renders the ECP (ACH) form. Per the source, vaultToken is submit-only
// and the ECP form needs no init data, so placeholder values are enough to render.
export function AccountPaymentsMicroapp({
  assets,
  countries,
}: {
  assets: MicroappAssets;
  countries: MicroappCountry[];
}) {
  const started = useRef(false);
  const [status, setStatus] = useState('Loading microapp…');

  useEffect(() => {
    if (started.current) {
      return;
    }

    started.current = true;

    if (assets.js.length === 0) {
      setStatus(`No microapp assets found. ${assets.error ?? ''}`);

      return;
    }

    // Local dev servers serve stable filenames (no content hash), so append a
    // per-load cache-buster to defeat any stale browser cache entry. The CDN uses
    // hashed names, so it needs none.
    const isLocalBase = assets.base.startsWith('http://');
    const cacheBust = Date.now();
    const toUrl = (path: string) => {
      const url = new URL(path, assets.base);

      if (isLocalBase) {
        url.searchParams.set('t', String(cacheBust));
      }

      return url.toString();
    };

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');

        script.src = src;
        // Dynamically inserted scripts still execute in insertion order when async is false.
        script.async = false;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });

    const run = async () => {
      // Load in manifest order (runtime, vendors, main); async=false preserves execution order.
      await Promise.all(assets.js.map((js) => loadScript(toUrl(js))));

      const render = window.BigCommerce?.renderAccountPayments;

      if (typeof render !== 'function') {
        setStatus('window.BigCommerce.renderAccountPayments is not defined after loading assets.');

        return;
      }

      render({
        styles: {},
        errorHandler: (message: string) => {
          // eslint-disable-next-line no-console
          console.error('[account-payments]', message);
        },
        storeContextData: {
          // ECP (ACH): routes to the plain bank-account form (needs no init data).
          providerId: 'test',
          methodType: 'ecp',
          storeLocale: 'en',
          countries,
          paymentsUrl: '',
          paymentMethodsUrl: '/account/payment-methods',
          // Submit-only fields. Placeholders are fine for a render-only POC.
          vaultToken: '',
          shopperId: '',
          storeHash: '',
          currencyCode: 'USD',
          customerEmail: '',
          paymentProviderInitializationData: {},
        },
      });

      setStatus('Microapp rendered.');
    };

    run().catch((error: unknown) => setStatus(`Error: ${String(error)}`));
  }, [assets, countries]);

  return (
    <div>
      <p className="mb-4 text-sm text-[hsl(var(--contrast-400))]">{status}</p>
      {/* The microapp mounts its own React tree into this fixed node id. */}
      <div id="bc-account-payments" />
    </div>
  );
}
