import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { unstable_rethrow as rethrow } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { addToOrCreateCart } from '~/lib/cart';
import { getCartId } from '~/lib/cart';
import { MissingCartError } from '~/lib/cart/error';
import { serverToast } from '~/lib/server-toast';

import { applyCouponCode } from '~/app/[locale]/(default)/cart/_actions/apply-coupon-code';

/**
 * Query to find a product by SKU using search API
 * Uses searchProducts with searchTerm filter which searches Name, SKU, and Description
 * Optimized to fetch only 10 products and stop at first match
 */
const FindProductBySkuQuery = graphql(`
  query FindProductBySkuQuery($sku: String!) {
    site {
      search {
        searchProducts(filters: { searchTerm: $sku }) {
          products(first: 10) {
            edges {
              node {
                entityId
                sku
                variants(first: 10) {
                  edges {
                    node {
                      entityId
                      sku
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

/**
 * Query to validate product exists by entityId
 */
const GetProductQuery = graphql(`
  query GetProductQuery($entityId: Int!) {
    site {
      product(entityId: $entityId) {
        entityId
      }
    }
  }
`);

/**
 * Query to get checkout entityId from cart
 */
const GetCheckoutEntityIdQuery = graphql(`
  query GetCheckoutEntityIdQuery($cartId: String!) {
    site {
      checkout(entityId: $cartId) {
        entityId
      }
    }
  }
`);

/**
 * Find product entityId by SKU
 */
async function findProductBySku(
  sku: string,
  customerAccessToken?: string,
): Promise<number | undefined> {
  try {
    const { data } = await client.fetch({
      document: FindProductBySkuQuery,
      variables: { sku },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const products = removeEdgesAndNodes(data.site.search.searchProducts.products);

    for (const product of products) {
      // Check variants first (more specific)
      const variants = removeEdgesAndNodes(product.variants);
      if (variants.some((variant: { sku: string }) => variant.sku === sku)) {
        return product.entityId;
      }

      // Check base product SKU
      if (product.sku === sku) {
        return product.entityId;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Validate product exists by entityId
 */
async function validateProduct(entityId: number, customerAccessToken?: string) {
  const { data } = await client.fetch({
    document: GetProductQuery,
    variables: { entityId },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.product?.entityId !== undefined;
}

/**
 * Get checkout entityId from cart
 * In BigCommerce, checkout entityId is the same as cart entityId, but we need to verify it exists
 */
async function getCheckoutEntityId(
  cartId: string,
  customerAccessToken?: string,
): Promise<string | undefined> {
  try {
    const { data } = await client.fetch({
      document: GetCheckoutEntityIdQuery,
      variables: { cartId },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return data.site.checkout?.entityId;
  } catch {
    return undefined;
  }
}

/**
 * Shared handler for add-to-cart URL requests
 * Supports BigCommerce Stencil-style add-to-cart URLs:
 * - /cart.php?action=add&product_id=123 (Stencil compatibility)
 * - /add-to-cart?action=add&product_id=123 (Catalyst-native)
 * - /cart.php?action=buy&sku=xlredtshirt
 * - /add-to-cart?action=add&product_id=123&qty=3
 * - /cart.php?action=add&product_id=123&couponcode=10off100
 */
export async function handleAddToCartUrl(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
): Promise<NextResponse> {
  const { locale } = await params;
  const searchParams = req.nextUrl.searchParams;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const t = await getTranslations('Cart.Errors');

  // Parse query parameters
  const action = searchParams.get('action') || 'add'; // 'add' or 'buy'
  const productIdParam = searchParams.get('product_id');
  const skuParam = searchParams.get('sku');
  const qtyParam = searchParams.get('qty');
  const couponCodeParam = searchParams.get('couponcode');

  // Validate that we have either product_id or sku
  if (!productIdParam && !skuParam) {
    await serverToast.error(t('productNotFound') || 'Product ID or SKU is required');

    return redirect({ href: '/cart', locale });
  }

  let productEntityId: number | undefined;

  // Get product entityId
  if (productIdParam) {
    const parsedProductId = Number.parseInt(productIdParam, 10);

    if (Number.isNaN(parsedProductId)) {
      await serverToast.error(t('invalidProductId') || 'Invalid product ID');

      return redirect({ href: '/cart', locale });
    }

    // Validate product exists
    const isValid = await validateProduct(parsedProductId, customerAccessToken);

    if (!isValid) {
      await serverToast.error(t('productNotFound') || 'Product not found');

      return redirect({ href: '/cart', locale });
    }

    productEntityId = parsedProductId;
  } else if (skuParam) {
    productEntityId = await findProductBySku(skuParam, customerAccessToken);

    if (!productEntityId) {
      await serverToast.error(t('productNotFound') || 'Product not found for SKU');

      return redirect({ href: '/cart', locale });
    }
  }

  // Parse quantity (default to 1)
  const quantity = qtyParam ? Number.parseInt(qtyParam, 10) : 1;

  if (Number.isNaN(quantity) || quantity < 1) {
    await serverToast.error(t('invalidQuantity') || 'Invalid quantity');

    return redirect({ href: '/cart', locale });
  }

  try {
    await addToOrCreateCart({
      lineItems: [
        {
          productEntityId,
          quantity,
        },
      ],
    });

    // Apply coupon code if provided
    // Note: We need to get the cartId after the cart is created/updated
    // and verify the checkout exists before applying the coupon
    if (couponCodeParam) {
      const cartId = await getCartId();

      if (cartId) {
        // Get checkout entityId to ensure checkout exists
        const checkoutEntityId = await getCheckoutEntityId(cartId, customerAccessToken);

        if (checkoutEntityId) {
          try {
            await applyCouponCode({
              checkoutEntityId,
              couponCode: couponCodeParam,
            });
          } catch (error: unknown) {
            if (error instanceof BigCommerceGQLError) {
              const errorMessage = error.errors[0]?.message || 'Failed to apply coupon code';

              await serverToast.error(errorMessage);
            } else {
              await serverToast.error('Failed to apply coupon code');
            }
          }
        }
      }
    }

    return redirect({ href: action === 'buy' ? '/checkout' : '/cart', locale });
  } catch (error: unknown) {
    rethrow(error);

    if (error instanceof BigCommerceGQLError) {
      const errorMessage = error.errors[0]?.message || t('somethingWentWrong') || 'Something went wrong';

      await serverToast.error(errorMessage);

      return redirect({ href: '/cart', locale });
    }

    if (error instanceof MissingCartError) {
      await serverToast.error(t('missingCart') || 'Cart not found');

      return redirect({ href: '/cart', locale });
    }

    await serverToast.error(t('somethingWentWrong') || 'Something went wrong');

    return redirect({ href: '/cart', locale });
  }
}

