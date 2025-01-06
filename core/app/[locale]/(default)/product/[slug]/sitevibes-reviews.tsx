'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
//import { useEffect } from 'react';
//import { useRouter } from 'next/navigation';
import Script from 'next/script';

export function SitevibesReviews({ product, category }: { product: any, category: any }) {

  const breadcrumbs = (category?.breadcrumbs)?(removeEdgesAndNodes(category?.breadcrumbs) as any[]).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  })): [];

  const productData = {
    product_id: product.entityId,
    product_sku: product.sku,
    name: product.name,
    description: product.plainTextDescription,
    url: product.path,
    image_url: product.defaultImage && product.defaultImage.url ? product.defaultImage.url.replace('{:size}', 'original') : null,
    category_name: breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.label : '',
    brand_name: product.brand?.name,
    quantity: 1,
    price: product.prices?.price.value,
  }

  /*
  useEffect(() => {
    var SiteVibesProduct = productData;
    if (typeof window !== 'undefined' && window.SiteVibesEvents && typeof window.SiteVibesEvents.pageRefresh === 'function') {
      SiteVibesProduct.url = window.location.href;
      window.SiteVibesEvents.pageRefresh();
    }
  }, []);
  */

  return (
    <div>
      <Script id="sitevibes-product-data">
        {`
          var SiteVibesProduct = ${JSON.stringify(productData)};
          if (typeof window !== 'undefined' && window.SiteVibesEvents && typeof window.SiteVibesEvents.pageRefresh === 'function') {
            SiteVibesProduct.url = window.location.href;
            window.SiteVibesEvents.pageRefresh();
          }
        `}
      </Script>
      <div id="sitevibes-product-reviews"></div>
    </div>
  );
}
