'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getCartId } from '~/lib/cart';

import { getCart } from '../page-data';

const InStockQuery = graphql(`
  query IsInStockQuery($productEntityId: Int!, $variantEntityIds: [Int!]) {
    site {
      product(entityId: $productEntityId) {
        name
        inventory {
          isInStock
        }
        variants(entityIds: $variantEntityIds) {
          edges {
            node {
              entityId
              options {
                edges {
                  node {
                    displayName
                    values {
                      edges {
                        node {
                          label
                        }
                      }
                    }
                  }
                }
              }
              inventory {
                isInStock
              }
            }
          }
        }
      }
    }
  }
`);

interface OutOfStockItem {
  productName: string;
  productEntityId: number;
  variantEntityId?: number;
  variantOptions?: string;
}

async function checkStockStatus(productEntityId: number, variantEntityIds: number[]) {
  const { data } = await client.fetch({
    document: InStockQuery,
    variables: { productEntityId, variantEntityIds },
    fetchOptions: { cache: 'no-store' },
  });

  const outOfStockItems: OutOfStockItem[] = [];

  if (!data.site.product) {
    return outOfStockItems;
  }

  const product = data.site.product;
  const productName = product.name;

  if (variantEntityIds.length === 0 && !product.inventory.isInStock) {
    outOfStockItems.push({
      productName,
      productEntityId,
    });
  }

  product.variants.edges?.forEach((edge) => {
    const variant = edge.node;

    if (!variant.inventory?.isInStock) {
      const variantOptions = variant.options.edges
        ?.map((optionEdge) => {
          const option = optionEdge.node;
          const values =
            option.values.edges?.map((valueEdge) => valueEdge.node.label).join(', ') || '';

          return `${option.displayName}: ${values}`;
        })
        .join(', ');

      outOfStockItems.push({
        productName,
        productEntityId,
        variantEntityId: variant.entityId,
        variantOptions: variantOptions || undefined,
      });
    }
  });

  return outOfStockItems;
}

export const redirectToCheckout = async (
  _lastResult: SubmissionResult | null,
  formData: FormData,
): Promise<SubmissionResult | null> => {
  const t = await getTranslations('Cart.Errors');

  const submission = parseWithZod(formData, { schema: z.object({}) });

  const cartId = await getCartId();

  if (!cartId) {
    return submission.reply({ formErrors: [t('cartNotFound')] });
  }

  const data = await getCart({ cartId });

  const cart = data.site.cart;

  if (!cart) {
    return submission.reply({ formErrors: [t('cartNotFound')] });
  }

  const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];

  console.dir({ lineItems }, { depth: null });

  const productVariantMap = lineItems.reduce<
    Array<{ productEntityId: number; variantEntityIds: number[] }>
  >((acc, item) => {
    const existing = acc.find((entry) => entry.productEntityId === item.productEntityId);

    if (existing && item.variantEntityId) {
      existing.variantEntityIds.push(item.variantEntityId);
    } else {
      acc.push({
        productEntityId: item.productEntityId,
        variantEntityIds: item.variantEntityId ? [item.variantEntityId] : [],
      });
    }

    return acc;
  }, []);

  console.dir({ productVariantMap }, { depth: null });

  const stockCheckPromises = productVariantMap.map(({ productEntityId, variantEntityIds }) =>
    checkStockStatus(productEntityId, variantEntityIds),
  );

  const stockResults = await Promise.all(stockCheckPromises);
  const outOfStockItems = stockResults.flat();

  if (outOfStockItems.length > 0) {
    const errorMessages = outOfStockItems.map((item) => {
      if (item.variantEntityId && item.variantOptions) {
        return `"${item.productName}" (${item.variantOptions}) is out of stock`;
      }

      return `"${item.productName}" is out of stock`;
    });

    return submission.reply({
      formErrors: [...errorMessages],
    });
  }

  // @todo redirect to checkout
  return submission.reply({
    formErrors: ['All items are in stock - checkout redirect would go here'],
  });
};
