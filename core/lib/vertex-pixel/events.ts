/**
 * Vertex AI Retail JavaScript Pixel Event Functions
 * Client-side event tracking using the Vertex AI pixel library
 */

'use client';

/**
 * Track home page view
 */
export function trackHomePageView(visitorId: string): void {
  if (typeof window === 'undefined' || !window._gre) {
    return;
  }

  const event: VertexUserEvent = {
    eventType: 'home-page-view',
    visitorId,
  };

  window._gre.push(['logEvent', event]);
  // eslint-disable-next-line no-console
  console.log('[Vertex Pixel] Home page viewed');
}

/**
 * Track product detail page view
 */
export function trackProductView(visitorId: string, productId: string | number): void {
  if (typeof window === 'undefined' || !window._gre) {
    return;
  }

  const event: VertexUserEvent = {
    eventType: 'detail-page-view',
    visitorId,
    productDetails: [
      {
        product: {
          id: productId.toString(),
        },
      },
    ],
  };

  window._gre.push(['logEvent', event]);
  // eslint-disable-next-line no-console
  console.log('[Vertex Pixel] Product viewed:', productId);
}

/**
 * Track category page view
 */
export function trackCategoryView(
  visitorId: string,
  categoryId: string | number,
  productIds?: Array<string | number>,
): void {
  if (typeof window === 'undefined' || !window._gre) {
    return;
  }

  const event: VertexUserEvent = {
    eventType: 'category-page-view',
    visitorId,
    pageCategories: [categoryId.toString()],
    ...(productIds &&
      productIds.length > 0 && {
        productDetails: productIds.map((id) => ({
          product: { id: id.toString() },
        })),
      }),
  };

  window._gre.push(['logEvent', event]);
  // eslint-disable-next-line no-console
  console.log('[Vertex Pixel] Category viewed:', categoryId);
}

/**
 * Track search event with attribution token
 */
export function trackSearch(
  visitorId: string,
  searchQuery: string,
  attributionToken?: string,
  productIds?: Array<string | number>,
): void {
  if (typeof window === 'undefined' || !window._gre) {
    return;
  }

  const event: VertexUserEvent = {
    eventType: 'search',
    visitorId,
    searchQuery,
    ...(attributionToken && { attributionToken }),
    ...(productIds &&
      productIds.length > 0 && {
        productDetails: productIds.map((id) => ({
          product: { id: id.toString() },
        })),
      }),
  };

  window._gre.push(['logEvent', event]);
  // eslint-disable-next-line no-console
  console.log(
    `[Vertex Pixel] Search tracked: query="${searchQuery}", token=${attributionToken ? 'present' : 'missing'}`,
  );
}

/**
 * Track add to cart event
 */
export function trackAddToCart(
  visitorId: string,
  productId: string | number,
  quantity: number,
  price?: number,
  currencyCode?: string,
): void {
  if (typeof window === 'undefined' || !window._gre) {
    return;
  }

  const event: VertexUserEvent = {
    eventType: 'add-to-cart',
    visitorId,
    productDetails: [
      {
        product: {
          id: productId.toString(),
        },
        quantity,
        ...(price !== undefined && {
          priceInfo: {
            price,
            ...(currencyCode && { currencyCode }),
          },
        }),
      },
    ],
  };

  window._gre.push(['logEvent', event]);
  // eslint-disable-next-line no-console
  console.log('[Vertex Pixel] Add to cart:', productId, 'qty:', quantity);
}

/**
 * Track purchase complete event
 */
export function trackPurchase(
  visitorId: string,
  transactionId: string,
  revenue: number,
  currencyCode: string,
  products: Array<{
    productId: string | number;
    quantity: number;
    price: number;
  }>,
  tax?: number,
  shipping?: number,
): void {
  if (typeof window === 'undefined' || !window._gre) {
    return;
  }

  const event: VertexUserEvent = {
    eventType: 'purchase-complete',
    visitorId,
    productDetails: products.map((product) => ({
      product: {
        id: product.productId.toString(),
      },
      quantity: product.quantity,
      priceInfo: {
        price: product.price,
        currencyCode,
      },
    })),
    purchaseTransaction: {
      id: transactionId,
      revenue,
      ...(tax !== undefined && { tax }),
      ...(shipping !== undefined && { cost: shipping }),
      currencyCode,
    },
  };

  window._gre.push(['logEvent', event]);
  // eslint-disable-next-line no-console
  console.log('[Vertex Pixel] Purchase complete:', transactionId, 'revenue:', revenue);
}
