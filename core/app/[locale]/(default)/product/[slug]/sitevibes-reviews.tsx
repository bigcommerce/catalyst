'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function SitevibesReviews({ id }: { id: number }) {

  useEffect(() => {
    // Trigger page refresh for SPA support
    if (typeof window !== 'undefined' && (window as any).SiteVibesEvents) {
      ;(window as any).SiteVibesEvents.pageRefresh()
    }
  }, [])

  const productData = {
    product_id: id,
    product_sku: "SKU123",
    name: "Example Product",
    description: "This is an example product description.",
    url: `https://example.com/product/${id}`,
    image_url: "https://example.com/product-image.jpg",
    category_name: "Electronics",
    brand_name: "ExampleBrand",
    quantity: 1,
    price: 99.99,
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
