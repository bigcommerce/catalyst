import { getFormatter } from 'next-intl/server';

import { Order } from '@/ui/sections/order-list-section/order-list-item';
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
            return {
              id: lineItem.entityId.toString(),
              href: lineItem.baseCatalogProduct?.path ?? undefined,
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
