import { NextRequest, NextResponse } from 'next/server';

import { handleAddToCartUrl } from '~/lib/cart/add-to-cart-url-handler';

/**
 * Handle GET requests to /cart.php with add-to-cart URL parameters
 * Supports BigCommerce Stencil-style add-to-cart URLs for compatibility:
 * - /cart.php?action=add&product_id=123
 * - /cart.php?action=buy&sku=xlredtshirt
 * - /cart.php?action=add&product_id=123&qty=3
 * - /cart.php?action=add&product_id=123&couponcode=10off100
 *
 * Note: This route exists for Stencil compatibility. Catalyst-native stores
 * should use /add-to-cart instead.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
): Promise<NextResponse> {
  return handleAddToCartUrl(req, { params });
}

