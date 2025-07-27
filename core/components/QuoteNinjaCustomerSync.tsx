'use client';
declare global {
  interface Window {
    BN?: {
      log_in_customer: (customer: any) => Promise<boolean>;
    };
  }
}
import { useEffect } from 'react';

interface QuoteNinjaCustomerSyncProps {
  customer: any; // Should be the full BigCommerce V2 customer object
}

export const QuoteNinjaCustomerSync = ({ customer }: QuoteNinjaCustomerSyncProps) => {
  console.log('Hello from here');
  console.log(window);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.BN && customer) {
      window.BN.log_in_customer(customer)
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
};
