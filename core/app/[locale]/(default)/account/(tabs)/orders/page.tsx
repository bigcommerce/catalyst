import { notFound } from 'next/navigation';

import { OrdersContent } from './_components/orders-content';
import { getCustomerOrders } from './page-data';

interface Props {
  searchParams: {
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
    order?: string;
  };
}

export default async function OrdersPage({ searchParams }: Props) {
  const { before, after, order } = searchParams;
  const customerOrdersDetails = await getCustomerOrders({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!customerOrdersDetails) {
    notFound();
  }

  const { orders, pageInfo } = customerOrdersDetails;
  return <OrdersContent orderId={order} orders={orders} pageInfo={pageInfo} />;
}

export const runtime = 'edge';
