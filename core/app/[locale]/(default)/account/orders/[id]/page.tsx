import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { OrderDetailsSection } from '@/vibes/soul/sections/order-details-section';
import { getSessionCustomerAccessToken } from '~/auth';
import { orderDetailsTransformer } from '~/data-transformers/order-details-transformer';

import { getCustomerOrderDetails } from './page-data';

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function OrderDetails({ params }: Props) {
  const t = await getTranslations('Account.Orders.Details');
  const format = await getFormatter();

  const streamableOrder = Streamable.from(async () => {
    const { id } = await params;
    const customerAccessToken = await getSessionCustomerAccessToken();
    const order = await getCustomerOrderDetails(Number(id), customerAccessToken);

    if (!order) {
      notFound();
    }

    return orderDetailsTransformer(order, t, format);
  });

  const streamableTitle = Streamable.from(async () => {
    const { id } = await params;

    return t('title', { orderNumber: id });
  });

  return (
    <OrderDetailsSection
      order={streamableOrder}
      orderSummaryLabel={t('orderSummary')}
      prevHref="/account/orders"
      shipmentAddressLabel={t('shippingAddress')}
      shipmentMethodLabel={t('shippingMethod')}
      summaryTotalLabel={t('summaryTotal')}
      title={streamableTitle}
    />
  );
}
