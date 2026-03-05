import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { Order, OrderList } from '@/vibes/soul/sections/order-list';
import { getSessionCustomerAccessToken } from '~/auth';
import { ordersTransformer } from '~/data-transformers/orders-transformer';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';

import { getCustomerOrders } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  }>;
}

async function getOrders(locale: string, after?: string, before?: string): Promise<Order[]> {
  const [format, customerAccessToken] = await Promise.all([
    getFormatter(),
    getSessionCustomerAccessToken(),
  ]);
  const customerOrdersDetails = await getCustomerOrders(
    locale,
    { ...(after && { after }), ...(before && { before }) },
    customerAccessToken,
  );

  if (!customerOrdersDetails) {
    return [];
  }

  const { orders } = customerOrdersDetails;

  return ordersTransformer(orders, format);
}

async function getPaginationInfo(locale: string, after?: string, before?: string) {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const customerOrdersDetails = await getCustomerOrders(
    locale,
    { ...(after && { after }), ...(before && { before }) },
    customerAccessToken,
  );

  return pageInfoTransformer(customerOrdersDetails?.pageInfo ?? defaultPageInfo);
}

async function OrdersContent({ params, searchParams }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const { before, after } = await searchParams;
  const t = await getTranslations('Account.Orders');

  return (
    <OrderList
      emptyStateActionLabel={t('EmptyState.cta')}
      emptyStateTitle={t('EmptyState.title')}
      orderNumberLabel={t('orderNumber')}
      orders={getOrders(locale, after, before)}
      paginationInfo={getPaginationInfo(locale, after, before)}
      title={t('title')}
      totalLabel={t('totalPrice')}
      viewDetailsLabel={t('viewDetails')}
    />
  );
}

export default function Orders(props: Props) {
  return (
    <Suspense>
      <OrdersContent {...props} />
    </Suspense>
  );
}
