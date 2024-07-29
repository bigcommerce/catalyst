import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { Pagination } from '~/components/ui/pagination';

import { TabHeading } from '../../_components/tab-heading';
import { getCustomerOrders, getOrderDetails } from '../page-data';

import { OrderDetails } from './order-details';
import { OrdersList } from './orders-list';

type CustomerOrders = NonNullable<Awaited<ReturnType<typeof getCustomerOrders>>>;

interface Props {
  orderId?: string;
  orders: CustomerOrders['orders'];
  pageInfo: CustomerOrders['pageInfo'];
}

export const OrdersContent = async ({ orderId, orders, pageInfo }: Props) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Orders' });
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  if (orderId) {
    const orderData = await getOrderDetails({ orderId });

    return orderData ? <OrderDetails data={orderData} /> : notFound();
  }

  return (
    <>
      <TabHeading heading="orders" />
      {orders.length === 0 ? (
        <div className="mx-auto w-fit">{t('noOrders')}</div>
      ) : (
        <OrdersList customerOrders={orders} key={endCursor} />
      )}
      <div className="mb-14 inline-flex w-full justify-center py-6">
        <Pagination
          className="my-0 flex inline-flex justify-center text-center"
          endCursor={endCursor ?? undefined}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          startCursor={startCursor ?? undefined}
        />
      </div>
    </>
  );
};
