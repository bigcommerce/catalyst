import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { Order, OrderList } from '@/vibes/soul/sections/order-list';
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

async function getOrders(after?: string, before?: string): Promise<Order[]> {
  const format = await getFormatter();
  const customerOrdersDetails = await getCustomerOrders({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!customerOrdersDetails) {
    return [];
  }

  const { orders } = customerOrdersDetails;

  return ordersTransformer(orders, format);
}

async function getPaginationInfo(after?: string, before?: string) {
  const customerOrdersDetails = await getCustomerOrders({
    ...(after && { after }),
    ...(before && { before }),
  });

  return pageInfoTransformer(customerOrdersDetails?.pageInfo ?? defaultPageInfo);
}

export default async function Orders({ params, searchParams }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const { before, after } = await searchParams;
  const t = await getTranslations('Account.Orders');

  return (
    <OrderList
      orderNumberLabel={t('orderNumber')}
      orders={getOrders(after, before)}
      paginationInfo={getPaginationInfo(after, before)}
      title={t('title')}
      totalLabel={t('totalPrice')}
      viewDetailsLabel={t('viewDetails')}
    />
  );
}
