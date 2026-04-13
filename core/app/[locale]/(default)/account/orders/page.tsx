import { getFormatter, getTranslations } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
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

async function getOrders(
  locale: string,
  after?: string,
  before?: string,
  customerAccessToken?: string,
): Promise<Order[]> {
  const format = await getFormatter();
  const customerOrdersDetails = await getCustomerOrders(
    locale,
    {
      ...(after && { after }),
      ...(before && { before }),
    },
    customerAccessToken,
  );

  if (!customerOrdersDetails) {
    return [];
  }

  const { orders } = customerOrdersDetails;

  return ordersTransformer(orders, format);
}

async function getPaginationInfo(
  locale: string,
  after?: string,
  before?: string,
  customerAccessToken?: string,
) {
  const customerOrdersDetails = await getCustomerOrders(
    locale,
    {
      ...(after && { after }),
      ...(before && { before }),
    },
    customerAccessToken,
  );

  return pageInfoTransformer(customerOrdersDetails?.pageInfo ?? defaultPageInfo);
}

export default async function Orders({ params, searchParams }: Props) {
  const { locale } = await params;

  const t = await getTranslations('Account.Orders');

  return (
    <OrderList
      emptyStateActionLabel={t('EmptyState.cta')}
      emptyStateTitle={t('EmptyState.title')}
      orderNumberLabel={t('orderNumber')}
      orders={Streamable.from(async () => {
        const [{ before, after }, customerAccessToken] = await Promise.all([
          searchParams,
          getSessionCustomerAccessToken(),
        ]);

        return getOrders(locale, after, before, customerAccessToken);
      })}
      paginationInfo={Streamable.from(async () => {
        const [{ before, after }, customerAccessToken] = await Promise.all([
          searchParams,
          getSessionCustomerAccessToken(),
        ]);

        return getPaginationInfo(locale, after, before, customerAccessToken);
      })}
      title={t('title')}
      totalLabel={t('totalPrice')}
      viewDetailsLabel={t('viewDetails')}
    />
  );
}
