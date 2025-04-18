import { getFormatter, getTranslations } from 'next-intl/server';

import { Order } from '@/ui/sections/order-details-section';
import { ExistingResultType } from '~/client/util';

import { getCustomerOrderDetails } from '../app/[locale]/(default)/account/orders/[id]/page-data';

function getStatusColor(
  status: ExistingResultType<typeof getCustomerOrderDetails>['status']['value'],
) {
  switch (status) {
    case 'AWAITING_FULFILLMENT':
    case 'AWAITING_SHIPMENT':
    case 'AWAITING_PICKUP':
    case 'PARTIALLY_SHIPPED':
    case 'PENDING':
    case 'SHIPPED':
      return 'info';

    case 'AWAITING_PAYMENT':
    case 'DISPUTED':
    case 'INCOMPLETE':
    case 'MANUAL_VERIFICATION_REQUIRED':
      return 'warning';

    case 'CANCELLED':
    case 'DECLINED':
      return 'error';

    case 'COMPLETED':
    case 'PARTIALLY_REFUNDED':
    case 'REFUNDED':
      return 'success';
  }
}

export const orderDetailsTransformer = (
  order: ExistingResultType<typeof getCustomerOrderDetails>,
  t: ExistingResultType<typeof getTranslations<'Account.Orders.Details'>>,
  format: ExistingResultType<typeof getFormatter>,
): Order => {
  return {
    date: format.dateTime(new Date(order.orderedAt.utc)),
    id: String(order.entityId),
    status: order.status.label,
    statusColor: getStatusColor(order.status.value),
    destinations:
      order.consignments.shipping?.map((consignment, index, arr) => {
        return {
          id: String(consignment.entityId),
          lineItems: consignment.lineItems.map((lineItem) => {
            return {
              id: String(lineItem.entityId),
              title: lineItem.name,
              subtitle: lineItem.brand ?? '',
              price: format.number(lineItem.subTotalListPrice.value, {
                style: 'currency',
                currency: lineItem.subTotalListPrice.currencyCode,
              }),
              href: lineItem.baseCatalogProduct?.path ?? undefined,
              image: lineItem.image
                ? {
                    src: lineItem.image.url,
                    alt: lineItem.image.altText,
                  }
                : undefined,
              quantity: lineItem.quantity,
            };
          }),
          title:
            arr.length > 1
              ? t('destinationWithCount', { number: index + 1, total: arr.length })
              : t('destination'),
          address: {
            city: consignment.shippingAddress.city ?? '',
            country: consignment.shippingAddress.country,
            state: consignment.shippingAddress.stateOrProvince ?? '',
            street1: consignment.shippingAddress.address1 ?? '',
            street2: consignment.shippingAddress.address2 ?? '',
            name: `${consignment.shippingAddress.firstName} ${consignment.shippingAddress.lastName}`,
            zipcode: consignment.shippingAddress.postalCode,
          },
          shipments: consignment.shipments.map((shipment) => {
            return {
              name: shipment.shippingMethodName,
              status: format.dateTime(new Date(shipment.shippedAt.utc)),
              tracking: shipment.tracking ?? undefined,
            };
          }),
        };
      }) ?? [],
    summary: {
      total: format.number(order.totalIncTax.value, {
        style: 'currency',
        currency: order.totalIncTax.currencyCode,
      }),
      lineItems: [
        {
          label: t('subtotal'),
          value: format.number(order.subTotal.value, {
            style: 'currency',
            currency: order.subTotal.currencyCode,
          }),
        },
        ...order.discounts.couponDiscounts.map((discount) => {
          return {
            label: discount.couponCode,
            value: `-${format.number(discount.discountedAmount.value, {
              style: 'currency',
              currency: discount.discountedAmount.currencyCode,
            })}`,
          };
        }),
        {
          label: t('shipping'),
          value: format.number(order.shippingCostTotal.value, {
            style: 'currency',
            currency: order.shippingCostTotal.currencyCode,
          }),
        },
        {
          label: t('tax'),
          value: format.number(order.taxTotal.value, {
            style: 'currency',
            currency: order.taxTotal.currencyCode,
          }),
        },
      ],
    },
  };
};
