'use client';

// [>] Developer Notes
//
// * Made for use with Catalyst, by BigCommerce: https://www.catalyst.dev/
//
// * Requires NEXT_PUBLIC_PAYPAL_CLIENT_ID env var
//  - By default it will fall back to 'test' if not set, which uses the non-transacting PayPal sandbox
//  - You can get your PayPal Client ID here: https://developer.paypal.com/dashboard/applications/live
//
// * PayPal documentation is here: https://developer.paypal.com/docs/checkout/pay-later/us/integrate/reference/
//
// Use this component like: <PayPalPayLater amount={product.price} currency="USD" />

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface PriceRange {
  type: 'range';
  minValue: string;
  maxValue: string;
}

interface PriceSale {
  type: 'sale';
  previousValue: string;
  currentValue: string;
}

type Price = string | PriceRange | PriceSale;

interface PayPalPayLaterProps {
  amount: Price;
  currency: string;
}

interface PayPalMessageOptions {
  amount: number;
  currency: string;
  style?: {
    layout?: 'text' | 'flex' | 'custom';
    logo?: {
      type?: 'inline' | 'primary' | 'alternative' | 'none';
      position?: 'left' | 'right' | 'top';
    };
    text?: {
      color?: string;
      size?: number;
      align?: 'left' | 'center' | 'right';
    };
    color?: string;
  };
}

declare global {
  interface Window {
    paypal?: {
      Messages: new (options: PayPalMessageOptions) => { render: (target: HTMLElement) => void };
    };
  }
}

export function removeCurrencySymbol(price: string): string {
  // Remove common currency symbols and thousands separators
  return price.replace(/[£$€¥,]/g, '').trim();
}

export function getDisplayPrice(price: Price): number {
  if (typeof price === 'string') {
    // Remove common currency symbols and thousands separators
    return parseFloat(price.replace(/[£$€¥,]/g, '').trim());
  }

  switch (price.type) {
    case 'range':
      return parseFloat(price.minValue);

    case 'sale':
      return parseFloat(price.currentValue);

    default:
      return 0;
  }
}

export function PayPalPayLater({ amount, currency }: PayPalPayLaterProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const displayAmount = getDisplayPrice(amount);

  // As of 12/23/2024 PayPal Pay Later supports these currencies
  const supportedCurrencies = ['USD', 'GBP', 'EUR', 'AUD'];

  useEffect(() => {
    if (scriptReady && paypalRef.current && window.paypal) {
      const paypalMessages = new window.paypal.Messages({
        amount: displayAmount,
        currency,
        style: {
          layout: 'text',
          text: {
            size: 14,
          },
          logo: {
            type: 'primary',
          },
        },
      });

      paypalMessages.render(paypalRef.current);
    }
  }, [scriptReady, displayAmount, currency]);

  if (!supportedCurrencies.includes(currency)) {
    return null;
  }

  return (
    <>
      <Script
        className="paypal-button"
        onReady={() => setScriptReady(true)}
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test'}&components=messages`}
        strategy="lazyOnload"
      />
      <div className="flex justify-center mt-[1.4em] min-h-7" ref={paypalRef} />
    </>
  );
}
