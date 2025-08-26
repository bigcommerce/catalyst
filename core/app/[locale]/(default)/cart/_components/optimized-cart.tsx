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
  }, [preGeneratedUrl]);

  // Custom action that checks URL validity before redirecting
  const optimizedCheckoutAction: CheckoutAction = async (lastResult, formData) => {
    // Check if we have a valid pre-generated URL (accounting for clock skew and page load time)
    if (checkoutUrl && isCheckoutUrlValid(checkoutUrl, pageLoadTime)) {
      // Direct client-side redirect for better performance
      router.push(checkoutUrl);

      // Return null to prevent further processing
      return null;
    }

    // Fall back to the original server action if URL is invalid or missing
    return fallbackAction(lastResult, formData);
  };

  return <CartComponent {...cartProps} checkoutAction={optimizedCheckoutAction} />;
}
