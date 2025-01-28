'use client';

declare global {
  interface Window {
    SiteVibesProduct?: any;
    SiteVibesEvents?: {
      pageRefresh: () => void;
    };
  }
}

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useEffect } from 'react';

export function SiteVibesReviews({ product, category }: { product: any; category: any }) {
  const breadcrumbs = category?.breadcrumbs
    ? (removeEdgesAndNodes(category?.breadcrumbs) as any[]).map(({ name, path }) => ({
        label: name,
        href: path ?? '#',
      }))
    : [];

  const productData = {
    product_id: product.entityId,
    product_sku: product.sku,
    name: product.name,
    description: product.plainTextDescription,
    url: product.path,
    image_url:
      product.defaultImage && product.defaultImage.url
        ? product.defaultImage.url.replace('{:size}', 'original')
        : null,
    category_name:
      breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.label : '',
    brand_name: product.brand?.name,
    quantity: 1,
    price: product.prices?.price.value,
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      productData.url = window.location.href;
      window.SiteVibesProduct = productData;
      if (window.SiteVibesEvents && typeof window.SiteVibesEvents.pageRefresh === 'function') {
        window.SiteVibesEvents.pageRefresh();
      }
    }
  }, [product.entityId]);

  return <div id="sitevibes-product-reviews" className="mb-[60px] xl:mb-[0px] relative z-[-1]" />
}
