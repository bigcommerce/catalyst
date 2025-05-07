import { getFormatter } from 'next-intl/server';

import { Order } from '@/vibes/soul/sections/order-list';
import { getCustomerOrders } from '~/app/[locale]/(default)/account/orders/page-data';
import { ExistingResultType } from '~/client/util';

export const ordersTransformer = (
  orders: ExistingResultType<typeof getCustomerOrders>['orders'],
  format: ExistingResultType<typeof getFormatter>,
): Order[] => {
  return orders.map((order) => {
    return {
      id: order.entityId.toString(),
      href: `/account/orders/${order.entityId}`,
      status: order.status.label,
      totalPrice: format.number(order.totalIncTax.value, {
        style: 'currency',
        currency: order.totalIncTax.currencyCode,
      }),
      lineItems:
        order.consignments.shipping?.flatMap((consignment) => {
          return consignment.lineItems.map((lineItem) => {
            const price = lineItem.catalogProductWithOptionSelections?.prices?.price
              ? format.number(lineItem.catalogProductWithOptionSelections.prices.price.value, {
                  style: 'currency',
                  currency: lineItem.catalogProductWithOptionSelections.prices.price.currencyCode,
                })
              : format.number(lineItem.subTotalListPrice.value / lineItem.quantity, {
                  style: 'currency',
                  currency: lineItem.subTotalListPrice.currencyCode,
                });

            return {
              id: lineItem.entityId.toString(),
              href: lineItem.baseCatalogProduct?.path ?? '#',
              title: lineItem.name,
              subtitle: lineItem.brand ?? undefined,
              price,
              totalPrice: format.number(lineItem.subTotalListPrice.value, {
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
    } satisfies Order;
  });
};
