'use client';
declare global {
  interface Window {
    BN?: any;
  }
}
import { useEffect } from 'react';
import { User } from '~/lib/user';

interface QuoteNinjaCustomerSyncProps {
  customer: User;
}

export const QuoteNinjaCustomerSync = ({ customer }: QuoteNinjaCustomerSyncProps) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.BN && customer) {
      window.BN.log_in_customer({
        ...customer,
      })
        .then((result: boolean) => {
          if (!result) {
            // Optionally handle failed login (e.g., show error, log)
            console.warn('QuoteNinja customer sync failed: invalid customer data');
          }
        })
        .catch((err: any) => {
          // Optionally handle error
          console.error('QuoteNinja customer sync error:', err);
        });
    }
  }, [customer]);

  return null;
  // <button
  //   id="qn-cart-to-quote"
  //   className="qn-button qn-hover-button qn-hover-button-expanded bg-black text-white"
  //   onClick={() => {
  //     if (typeof window !== 'undefined' && window.BN && window.BN.show_quote) {
  //       console.log('quoted window', window.BN);
  //       window.BN.show_quote('quote-view');
  //     }
  //   }}
  // >
  //   View Quote
  // </button>
};
