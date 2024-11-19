import { notFound } from 'next/navigation';

import { OrdersContent } from './_components/orders-content';
import { getCustomerOrders } from './page-data';

interface Props {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  }>;
}

export default async function Orders({ searchParams }: Props) {
  const { before, after } = await searchParams;

  const customerOrdersDetails = await getCustomerOrders({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!customerOrdersDetails) {
    notFound();
  }

  const { orders, pageInfo } = customerOrdersDetails;

  return <OrdersContent orders={orders} pageInfo={pageInfo} />;
}

export const runtime = 'edge';
