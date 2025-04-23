import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { ordersTransformer } from '~/data-transformers/orders-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { OrderListSection } from '~/vibes/soul/sections/order-list-section';

import { getCustomerOrders } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  }>;
}

export default async function Orders({ params, searchParams }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const { before, after } = await searchParams;
  const t = await getTranslations('Account.Orders');
  const format = await getFormatter();

  const customerOrdersDetails = await getCustomerOrders({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!customerOrdersDetails) {
    notFound();
  }

  const { orders, pageInfo } = customerOrdersDetails;

  return (
    <OrderListSection
      orderNumberLabel={t('orderNumber')}
      orders={ordersTransformer(orders, format)}
      paginationInfo={pageInfoTransformer(pageInfo)}
      title={t('title')}
      totalLabel={t('totalPrice')}
      viewDetailsLabel={t('viewDetails')}
    />
  );
}
