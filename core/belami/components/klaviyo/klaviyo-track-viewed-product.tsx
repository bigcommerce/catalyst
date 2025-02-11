'use client';

import { useEffect } from 'react';
import { getProduct } from './get-product';

declare global {
  interface Window {
    klaviyo?: KlaviyoEvent[];
  }
}

type KlaviyoEvent =
  | [eventType: 'identify', item: Record<string, unknown>]
  | [eventType: 'trackViewedItem', item: Record<string, unknown>]
  | [eventType: 'track', eventName: string, item: Record<string, unknown>];

type Product = Awaited<ReturnType<typeof getProduct>>;

export function KlaviyoTrackViewedProduct({ product, user }: { product: NonNullable<Product>, user?: { email: string } }) {
  useEffect(() => {
    const klaviyo = window.klaviyo || [];

    const viewedProductData = {
      Name: product.name,
      ProductID: product.entityId,
      ...(product.defaultImage && product.defaultImage.url && { ImageURL: product.defaultImage.url.replace('{:size}', '386x513') }),
      ...(product.brand && { Brand: product.brand.name }),
      ...(product.prices && { Price: product.prices.price.value }),
    };

//alert(JSON.stringify(user && user.email ? user : { anonymous: true }));
    //klaviyo.push(['identify', user && user.email ? user : { anonymous: true }]);
    //klaviyo.push(['identify', { email: "dmitry-tester@test.com" }]);
    klaviyo.push(['track', 'Catalyst Viewed Product', viewedProductData]);
    klaviyo.push(['trackViewedItem', viewedProductData]);
  }, []);  //}, [product.brand, product.defaultImage, product.entityId, product.name, product.prices]);

  return null;
}