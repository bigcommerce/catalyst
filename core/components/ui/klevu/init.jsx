'use client'

import { KlevuInit } from '@klevu/ui-react';
import React from 'react';

export function KlevuInitWrapper({ children }) {

  return (
    <KlevuInit
      apiKey="klevu-172166885635617473"
      settings={{
        generateProductUrl: function generateProductUrl(product) {
          const url = URL.parse(product.url);

          return url.pathname;
        },
        onItemClick: function onItemClick(product, event) {
          console.log(product,event);
        },
        renderPrice: function renderPrice(amount, currency) {

          return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
          }).format(parseFloat(amount));
        },
      }}
      url="https://uscs33v2.ksearchnet.com/cs/v2/search"
    >
      {children}
    </KlevuInit>
  );
}
