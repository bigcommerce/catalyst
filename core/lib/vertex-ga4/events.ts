/**
 * Vertex AI Retail GA4 Event Tracking
 * Maps GA4 events to Vertex AI Search for commerce events
 * Based on: https://docs.cloud.google.com/retail/docs/user-events#ga4-mapping
 */

'use client';

/**
 * Get visitor ID from cookie (user_pseudo_id for GA4)
 */
function getVisitorId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try to get from cookie
  const cookies = document.cookie.split(';');
  const visitorCookie = cookies.find((c) => c.trim().startsWith('catalyst.visitorId='));

  if (visitorCookie) {
    return visitorCookie.split('=')[1]?.trim() || null;
  }

  return null;
}

/**
 * Get user ID if available (for logged-in users)
 */
function getUserId(): string | undefined {
  // This can be extended to get user ID from auth context
  return undefined;
}

/**
 * Track home page view
 * Maps to GA4: view_homepage → Vertex: home-page-view
 */
export function trackHomePageView(visitorId?: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const id = visitorId || getVisitorId();

  if (!id) {
    return;
  }

  const userId = getUserId();

  // Track view_homepage event (maps to home-page-view in Vertex)
  // user_pseudo_id is automatically set by GA4, but we ensure user_id is set if available
  window.gtag('event', 'view_homepage', {
    ...(userId && { user_id: userId }),
    // Store visitorId in custom parameter for Vertex mapping
    visitor_id: id,
  });

  // eslint-disable-next-line no-console
  console.log('[Vertex GA4] Home page viewed');
}

/**
 * Track product detail page view
 * Maps to GA4: view_item → Vertex: detail-page-view
 */
export function trackProductView(
  visitorId: string | undefined,
  productId: string | number,
  productData?: {
    name?: string;
    price?: number;
    currency?: string;
    brand?: string;
    category?: string;
  },
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const id = visitorId || getVisitorId();

  if (!id) {
    return;
  }

  const userId = getUserId();

  // Track view_item event (maps to detail-page-view in Vertex)
  // user_pseudo_id is automatically set by GA4, but we ensure user_id is set if available
  window.gtag('event', 'view_item', {
    ...(userId && { user_id: userId }),
    // Store visitorId in custom parameter for Vertex mapping
    visitor_id: id,
    currency: productData?.currency || 'USD',
    value: productData?.price || 0,
    items: [
      {
        item_id: productId.toString(),
        item_name: productData?.name,
        price: productData?.price,
        currency: productData?.currency || 'USD',
        item_brand: productData?.brand,
        item_category: productData?.category,
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log('[Vertex GA4] Product viewed:', productId);
}

/**
 * Track category page view
 * Maps to GA4: view_item_list + pageCategories → Vertex: category-page-view or search
 */
export function trackCategoryView(
  visitorId: string | undefined,
  categoryId: string | number,
  categoryName?: string,
  productIds?: Array<string | number>,
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const id = visitorId || getVisitorId();

  if (!id) {
    return;
  }

  const userId = getUserId();

  // Track view_item_list with pageCategories (maps to category-page-view or search in Vertex)
  // user_pseudo_id is automatically set by GA4, but we ensure user_id is set if available
  window.gtag('event', 'view_item_list', {
    ...(userId && { user_id: userId }),
    // Store visitorId in custom parameter for Vertex mapping
    visitor_id: id,
    item_list_id: categoryId.toString(),
    item_list_name: categoryName || categoryId.toString(),
    page_categories: [categoryId.toString()],
    ...(productIds &&
      productIds.length > 0 && {
        items: productIds.map((pid) => ({
          item_id: pid.toString(),
        })),
      }),
  });

  // eslint-disable-next-line no-console
  console.log('[Vertex GA4] Category viewed:', categoryId);
}

/**
 * Track search event
 * Maps to GA4: view_item_list + searchQuery → Vertex: search
 */
export function trackSearch(
  visitorId: string | undefined,
  searchQuery: string,
  attributionToken?: string,
  productIds?: Array<string | number>,
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const id = visitorId || getVisitorId();

  if (!id) {
    return;
  }

  const userId = getUserId();

  // Track view_item_list with search_term (maps to search in Vertex)
  // user_pseudo_id is automatically set by GA4, but we ensure user_id is set if available
  window.gtag('event', 'view_item_list', {
    ...(userId && { user_id: userId }),
    // Store visitorId in custom parameter for Vertex mapping
    visitor_id: id,
    search_term: searchQuery,
    ...(attributionToken && {
      // Store attribution token in custom parameter
      attribution_token: attributionToken,
    }),
    ...(productIds &&
      productIds.length > 0 && {
        items: productIds.map((pid) => ({
          item_id: pid.toString(),
        })),
      }),
  });

  // eslint-disable-next-line no-console
  console.log(
    `[Vertex GA4] Search tracked: query="${searchQuery}", token=${attributionToken ? 'present' : 'missing'}`,
  );
}

/**
 * Track add to cart event
 * Maps to GA4: add_to_cart → Vertex: add-to-cart
 */
export function trackAddToCart(
  visitorId: string | undefined,
  productId: string | number,
  quantity: number,
  price?: number,
  currencyCode?: string,
  productName?: string,
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const id = visitorId || getVisitorId();

  if (!id) {
    return;
  }

  const userId = getUserId();

  // Track add_to_cart event (maps to add-to-cart in Vertex)
  // user_pseudo_id is automatically set by GA4, but we ensure user_id is set if available
  window.gtag('event', 'add_to_cart', {
    ...(userId && { user_id: userId }),
    // Store visitorId in custom parameter for Vertex mapping
    visitor_id: id,
    currency: currencyCode || 'USD',
    value: price ? price * quantity : 0,
    items: [
      {
        item_id: productId.toString(),
        item_name: productName,
        price: price,
        quantity: quantity,
        currency: currencyCode || 'USD',
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log('[Vertex GA4] Add to cart:', productId, 'qty:', quantity);
}

/**
 * Track shopping cart page view
 * Maps to GA4: begin_checkout → Vertex: shopping-cart-page-view
 */
export function trackShoppingCartView(
  visitorId: string | undefined,
  products: Array<{
    productId: string | number;
    quantity: number;
    price?: number;
    name?: string;
  }>,
  currencyCode?: string,
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const id = visitorId || getVisitorId();

  if (!id) {
    return;
  }

  const userId = getUserId();

  // Track begin_checkout event (maps to shopping-cart-page-view in Vertex)
  // user_pseudo_id is automatically set by GA4, but we ensure user_id is set if available
  window.gtag('event', 'begin_checkout', {
    ...(userId && { user_id: userId }),
    // Store visitorId in custom parameter for Vertex mapping
    visitor_id: id,
    currency: currencyCode || 'USD',
    value: products.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0),
    items: products.map((product) => ({
      item_id: product.productId.toString(),
      item_name: product.name,
      price: product.price,
      quantity: product.quantity,
      currency: currencyCode || 'USD',
    })),
  });

  // eslint-disable-next-line no-console
  console.log('[Vertex GA4] Shopping cart viewed');
}

/**
 * Track purchase complete event
 * Maps to GA4: purchase → Vertex: purchase-complete
 */
export function trackPurchase(
  visitorId: string | undefined,
  transactionId: string,
  revenue: number,
  currencyCode: string,
  products: Array<{
    productId: string | number;
    quantity: number;
    price: number;
    name?: string;
  }>,
  tax?: number,
  shipping?: number,
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const id = visitorId || getVisitorId();

  if (!id) {
    return;
  }

  const userId = getUserId();

  // Track purchase event (maps to purchase-complete in Vertex)
  // user_pseudo_id is automatically set by GA4, but we ensure user_id is set if available
  window.gtag('event', 'purchase', {
    ...(userId && { user_id: userId }),
    // Store visitorId in custom parameter for Vertex mapping
    visitor_id: id,
    transaction_id: transactionId,
    currency: currencyCode,
    value: revenue,
    ...(tax !== undefined && { tax: tax }),
    ...(shipping !== undefined && { shipping: shipping }),
    items: products.map((product) => ({
      item_id: product.productId.toString(),
      item_name: product.name,
      price: product.price,
      quantity: product.quantity,
      currency: currencyCode,
    })),
  });

  // eslint-disable-next-line no-console
  console.log('[Vertex GA4] Purchase complete:', transactionId, 'revenue:', revenue);
}

