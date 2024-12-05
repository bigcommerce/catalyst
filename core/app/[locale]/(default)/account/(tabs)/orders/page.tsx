import { notFound } from 'next/navigation';

import { OrdersContent } from './_components/orders-content';
import { getCustomerOrders } from './page-data';
import { OrderDetailsInfo } from '../../../checkout/order-confirmation/order-details';

interface Props {
  searchParams: {
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
    order?: string;
  };
}

export default async function OrdersPage({ searchParams }: Props) {
  console.log('========inside order=======');
  const { before, after, order } = await searchParams;
  console.log('========teststttttt=======');
  const customerOrdersDetails = await getCustomerOrders({
    ...(after && { after }),
    ...(before && { before }),
  });
  console.log('======customerOrdersDetails=========', JSON.stringify(customerOrdersDetails));
  if (!customerOrdersDetails) {
    return <OrderDetailsInfo />
    //notFound();
  }

  const { orders, pageInfo } = customerOrdersDetails;
  return <OrdersContent orderId={order} orders={orders} pageInfo={pageInfo} />;
}

//export const runtime = 'edge';
