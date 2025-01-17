import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';

import { OrderDetailsSection } from '@/vibes/soul/sections/order-details-section';
import { orderDetailsTransformer } from '~/data-transformers/order-details-transformer';

import { getCustomerOrderDetails } from './page-data';

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function Order(props: Props) {
  const { id, locale } = await props.params;
  const t = await getTranslations('Account.OrderDetails');
  const format = await getFormatter();

  const entityId = Number(id);

  const order = await getCustomerOrderDetails(entityId);

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailsSection
      order={orderDetailsTransformer(order, t, format)}
      prevHref={`/${locale}/account/orders`}
      shipmentAddressLabel={t('shippingAddressLabel')}
      shipmentMethodLabel={t('shippingMethodLabel')}
      summaryTotalLabel={t('summaryTotalLabel')}
      title={t('title', { orderNumber: id })}
    />
  );
}
