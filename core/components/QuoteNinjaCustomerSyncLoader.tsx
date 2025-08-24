'use client';
import { useEffect, useState } from 'react';

import type { ComponentProps } from 'react';
import { QuoteNinjaCustomerSync } from '~/components/QuoteNinjaCustomerSync';

type Props = {
  customer: ComponentProps<typeof QuoteNinjaCustomerSync>['customer'];
};

export function QuoteNinjaCustomerSyncLoader({ customer }: Props) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    const existingScript = document.getElementById('quoteninja-headless-script');
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.quoteninja.com/storefront/quoteninja-headless.js?storeID=wlbjjbyoi5';
    script.async = true;
    script.id = 'quoteninja-headless-script';
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptError(true);
    document.body.appendChild(script);
    return () => {
      script.onload = null;
      script.onerror = null;
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  if (scriptError) return <div>Failed to load QuoteNinja script.</div>;
  if (!scriptLoaded) return null;
  return <QuoteNinjaCustomerSync customer={customer} />;
}
