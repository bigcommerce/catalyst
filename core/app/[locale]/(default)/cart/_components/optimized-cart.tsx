'use client';

import { SubmissionResult } from '@conform-to/react';
import { useEffect, useState } from 'react';

import {
  CartClient as CartComponent,
  CartLineItem,
  CartProps,
} from '@/vibes/soul/sections/cart/client';
import { useRouter } from '~/i18n/routing';
import { isCheckoutUrlValid } from '~/lib/checkout-url-utils';

type CheckoutAction = (
  lastResult: SubmissionResult | null,
  formData: FormData,
) => Promise<SubmissionResult | null>;

interface OptimizedCartProps<LineItem extends CartLineItem> {
  preGeneratedUrl: string | null;
  fallbackAction: CheckoutAction;
  cartProps: CartProps<LineItem>;
}

export function OptimizedCart<LineItem extends CartLineItem>({
  preGeneratedUrl,
  fallbackAction,
  cartProps,
}: OptimizedCartProps<LineItem>) {
  const router = useRouter();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(preGeneratedUrl);
  const [pageLoadTime] = useState(() => Date.now()); // Capture when this component first mounted

  // Update the stored URL if a new one is provided
  useEffect(() => {
    setCheckoutUrl(preGeneratedUrl);
    
    // Inject speculation rule to prerender the checkout page
    // TEST: Using hardcoded URL for testing
    const testUrl = 'https://checkout.catalyst-canary.store/checkout?products=zz%3A1&order_source=buybutton&action=buy';
    
    if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'speculationrules';
      script.textContent = JSON.stringify({
        prerender: [
          {
            source: 'list',
            urls: [testUrl]
          }
        ]
      });
      script.id = 'checkout-speculation-rules';
      
      // Remove any existing speculation rules script
      const existingScript = document.getElementById('checkout-speculation-rules');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add the new script to the document
      document.head.appendChild(script);
      
      // Cleanup function to remove the script when component unmounts
      return () => {
        const scriptToRemove = document.getElementById('checkout-speculation-rules');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [preGeneratedUrl]);

  // Custom action that checks URL validity before redirecting
  const optimizedCheckoutAction: CheckoutAction = async (lastResult, formData) => {
    // TEST: Direct redirect to test URL
    router.push('https://checkout.catalyst-canary.store/checkout?products=zz%3A1&order_source=buybutton&action=buy')
    return null;
    
    // Production code (commented out for testing):
    // Check if we have a valid pre-generated URL (accounting for clock skew and page load time)
    if (checkoutUrl && isCheckoutUrlValid(checkoutUrl, pageLoadTime)) {
      // Direct client-side redirect for better performance
      // @ts-expect-error - Unreachable code for testing
      router.push(checkoutUrl);

      // Return null to prevent further processing
      return null;
    }

    // Fall back to the original server action if URL is invalid or missing
    return fallbackAction(lastResult, formData);
  };

  return <CartComponent {...cartProps} checkoutAction={optimizedCheckoutAction} />;
}
