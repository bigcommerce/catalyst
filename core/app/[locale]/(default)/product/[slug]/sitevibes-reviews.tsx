'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useEffect } from 'react';
import Script from 'next/script';

export function SitevibesReviews({ product, category }: { product: any, category: any }) {

  useEffect(() => {
    // Trigger page refresh for SPA support
    if (typeof window !== 'undefined' && (window as any).SiteVibesEvents) {
      ;(window as any).SiteVibesEvents.pageRefresh()
    }
  }, [])

  const breadcrumbs = (removeEdgesAndNodes(category.breadcrumbs) as any[]).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));

  const productData = {
    product_id: product.entityId,
    product_sku: product.sku,
    name: product.name,
    description: product.plainTextDescription,
    url: `https://localhost:3000${product.path}`,
    image_url: product.defaultImage && product.defaultImage.url ? product.defaultImage.url.replace('{size}', 'original') : null,
    category_name: breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.label : '',
    brand_name: product.brand?.name,
    quantity: 1,
    price: product.prices?.price.value,
  }

  return (
    <div>
      <Script id="sitevibes-product-data">
        {`
          var SiteVibesProduct = ${JSON.stringify(productData)};
        `}
      </Script>
      {/* START SiteVibes Product Review Tag */}
      <div id="sitevibes-product-reviews"></div>
      {/* END SiteVibes Product Review Tag */}
    </div>
  );
}
