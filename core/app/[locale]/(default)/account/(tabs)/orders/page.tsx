import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Pagination } from '~/components/ui/pagination';

import { TabHeading } from '../_components/tab-heading';

import { OrdersList } from './_components/orders-list';
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
  const t = await getTranslations('Account.Orders');

  const customerOrdersDetails = await getCustomerOrders({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!customerOrdersDetails) {
    notFound();
  }

  const { orders, pageInfo } = customerOrdersDetails;
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

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
}

export const runtime = 'edge';