import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { notFound } from 'next/navigation';

import { ExistingResultType } from '~/client/util';

import { OrderDetails } from './_components/order-details';
import { getOrderDetails, OrderDetailsType } from './page-data';
import { imageManagerImageUrl } from '~/lib/store-assets';

import wavingHandIcon from '~/public/pdp-icons/wavingHandIcon.svg'
interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

const mapOrderData = (order: OrderDetailsType) => {
  const shipping = order.consignments?.shipping
    ? removeEdgesAndNodes(order.consignments.shipping).map(
        ({ shipments, lineItems, ...otherItems }) => ({
          ...otherItems,
          lineItems: removeEdgesAndNodes(lineItems),
          shipments: removeEdgesAndNodes(shipments),
        }),
      )
    : undefined;

  return {
    orderState: {
      orderId: order.entityId,
      status: order.status,
      orderDate: order.orderedAt,
    },
    summaryInfo: {
      subtotal: order.subTotal,
      discounts: order.discounts,
      shipping: order.shippingCostTotal,
      tax: order.taxTotal,
      grandTotal: order.totalIncTax,
      handlingCost: order.handlingCostTotal
    },
    paymentInfo: {
      billingAddress: order.billingAddress,
      // TODO: add payments data
    },
    consignments: {
      shipping,
    },
  };
};

export type OrderDataType = ExistingResultType<typeof mapOrderData>;

export default async function Order(props: Props) {


  const { slug } = await props.params;
  const entityId = Number(slug);

  const order = await getOrderDetails({
    filter: {
      entityId,
    },
  });

  if (!order) {
    notFound();
  }

  const data = mapOrderData(order);

  return <OrderDetails data={data} icon={wavingHandIcon} />;
}

export const runtime = 'edge';
