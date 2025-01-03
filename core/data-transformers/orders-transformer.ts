import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';

import { Order } from '@/vibes/soul/sections/order-list-section/order-list-item';
import { getCustomerOrders } from '~/app/[locale]/(default)/account/orders/page-data';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ExistingResultType } from '~/client/util';

const ProductAttributes = graphql(`
  query ProductAttributes($entityIds: [Int!], $first: Int!) {
    site {
      products(entityIds: $entityIds, first: $first) {
        edges {
          node {
            entityId
            path
          }
        }
      }
    }
  }
`);

export const ordersTransformer = async (
  orders: ExistingResultType<typeof getCustomerOrders>['orders'],
  format: ExistingResultType<typeof getFormatter>,
): Promise<Order[]> => {
  const productIds = orders.reduce<number[]>((acc, order) => {
    // In the future we probably want to include downloads, email, and pickup consignments
    const shippingConsignment =
      order.consignments.shipping?.flatMap((consignment) =>
        removeEdgesAndNodes(consignment.lineItems),
      ) ?? [];

    return [
      ...acc,
      ...shippingConsignment.map((lineItem) => {
        return lineItem.productEntityId;
      }),
    ];
  }, []);

  // We need to fetch the product urls separately as our GQL API doesn't have a node
  // for these urls. In order to make it efficient, we aggregate all the products for
  // all the orders on the page and fetch them all at once.
  const { data } = await client.fetch({
    document: ProductAttributes,
    // We only display the first 5 orders on the page and we truncate the amount of
    // products are shown per order. The max products shown per order is 8 based on
    // the largest screen size, so we can safely fetch 50 products and feel comfortable.
    // 50 is the max we can fetch at once.
    variables: { entityIds: productIds, first: 50 },
    fetchOptions: { next: { revalidate } },
  });

  const productPaths = removeEdgesAndNodes(data.site.products);

  return orders.map((order) => {
    return {
      id: order.entityId.toString(),
      href: `/account/order/${order.entityId}`,
      status: order.status.label,
      totalPrice: format.number(order.totalIncTax.value, {
        style: 'currency',
        currency: order.totalIncTax.currencyCode,
      }),
      lineItems:
        order.consignments.shipping?.flatMap((consignment) => {
          return removeEdgesAndNodes(consignment.lineItems).map((lineItem) => {
            const productPath = productPaths.find(
              (product) => product.entityId === lineItem.productEntityId,
            );

            return {
              id: lineItem.entityId.toString(),
              href: productPath?.path ?? `/product/${lineItem.productEntityId}`,
              title: lineItem.name,
              subtitle: lineItem.brand ?? undefined,
              price: format.number(lineItem.subTotalListPrice.value, {
                style: 'currency',
                currency: lineItem.subTotalListPrice.currencyCode,
              }),
              image: lineItem.image
                ? {
                    src: lineItem.image.url,
                    alt: lineItem.image.altText,
                  }
                : undefined,
            };
          });
        }) ?? [],
    };
  });
};
