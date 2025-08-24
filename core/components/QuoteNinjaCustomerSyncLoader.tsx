'use client';
import { useEffect, useState } from 'react';

import type { ComponentProps } from 'react';
import { QuoteNinjaCustomerSync } from '~/components/QuoteNinjaCustomerSync';

type Props = {
  customer: ComponentProps<typeof QuoteNinjaCustomerSync>['customer'];
};

export function QuoteNinjaCustomerSyncLoader({ customer }: Props) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (document.getElementById('quoteninja-headless-script')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.quoteninja.com/storefront/quoteninja-headless.js?storeID=wlbjjbyoi5';
    script.async = true;
    script.id = 'quoteninja-headless-script';
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, []);

  if (!scriptLoaded) return null;
  return <QuoteNinjaCustomerSync customer={customer} />;
}
