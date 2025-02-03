'use client';

import { useEffect } from 'react';
import { getProduct } from './get-product';

declare global {
  interface Window {
    klaviyo?: KlaviyoEvent[];
  }
}

type KlaviyoEvent =
  | [eventType: 'trackViewedItem', item: Record<string, unknown>]
  | [eventType: 'track', eventName: string, item: Record<string, unknown>];

type Product = Awaited<ReturnType<typeof getProduct>>;

export function KlaviyoTrackViewedProduct({ product }: { product: NonNullable<Product> }) {
  useEffect(() => {
    const klaviyo = window.klaviyo || [];

    const viewedProductData = {
      Name: product.name,
      ProductID: product.entityId,
      ...(product.defaultImage && { ImageURL: product.defaultImage.url }),
      ...(product.brand && { Brand: product.brand.name }),
      ...(product.prices && { Price: product.prices.price.value }),
    };

    klaviyo.push(['track', 'Catalyst Viewed Product', viewedProductData]);
    klaviyo.push(['trackViewedItem', viewedProductData]);
  }, [product.brand, product.defaultImage, product.entityId, product.name, product.prices]);

  return null;
}