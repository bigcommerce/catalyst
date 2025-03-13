'use client';

import { ApolloProvider } from '@apollo/client';
import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { CartProvider } from '~/components/header/cart-provider';
import { CompareDrawerProvider } from '~/components/ui/compare-drawer';
import contentfulClient from '~/lib/contentful-client';

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      <Toaster position="top-right" />
      <CartProvider>
        <ApolloProvider client={contentfulClient}>
          <CompareDrawerProvider>{children}</CompareDrawerProvider>
        </ApolloProvider>
      </CartProvider>
    </>
  );
}
