import { NextRequest, NextResponse } from 'next/server';

import { handleAddToCartUrl } from '~/lib/cart/add-to-cart-url-handler';

/**
 * Handle GET requests to /add-to-cart with add-to-cart URL parameters
 * Catalyst-native route for adding products to cart via query parameters:
 * - /add-to-cart?action=add&product_id=123
 * - /add-to-cart?action=buy&sku=xlredtshirt
 * - /add-to-cart?action=add&product_id=123&qty=3
 * - /add-to-cart?action=add&product_id=123&couponcode=10off100
 *
 * Note: For Stencil compatibility, /cart.php is also supported.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
): Promise<NextResponse> {
  return handleAddToCartUrl(req, { params });
}

