import { notFound } from 'next/navigation';

import { ExistingResultType } from '~/client/util';

import { OrderDetails } from './_components/order-details';
import {
  addProductAttributesToShippingConsignments,
  getOrderDetails,
  OrderDetailsType,
} from './page-data';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

const mapOrderData = async (order: OrderDetailsType) => {
  const shipping =
    order.consignments?.shipping &&
    (await addProductAttributesToShippingConsignments(order.consignments.shipping));

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

  const data = await mapOrderData(order);

  return <OrderDetails data={data} />;
}

export const runtime = 'edge';
