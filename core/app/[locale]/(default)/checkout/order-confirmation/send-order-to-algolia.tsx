'use client';

import { useEffect } from 'react';
import aa from 'search-insights';

aa('init', {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '',
});

const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

interface Props {
    lineItems: any;
}

export const SendOrderToAlgolia = ({
  lineItems
}: Props) => {

  useEffect(() => {
    if (lineItems && lineItems.length > 0) {
      aa('purchasedObjectIDs', {
        eventName: 'Product Purchased',
        index: indexName,
        objectIDs: lineItems.map((item: any) => String(item.entityId)), // List of product IDs
        objectData: lineItems.map((item: any) => ({
          objectID: String(item.entityId),
          price: item.subTotalListPrice?.value,
          quantity: item.quantity,
        })), // List of product data
        currency: lineItems[0]?.subTotalListPrice?.currencyCode || 'USD',
      });
  }
  }, []);

  return <></>;
}