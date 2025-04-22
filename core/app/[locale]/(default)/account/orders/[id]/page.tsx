import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { orderDetailsTransformer } from '~/data-transformers/order-details-transformer';
import { OrderDetailsSection } from '~/ui/order-details-section';

import { getCustomerOrderDetails } from './page-data';

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function Order(props: Props) {
  const { id, locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Orders.Details');
  const format = await getFormatter();

  const order = await getCustomerOrderDetails({
    id: Number(id),
  });

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailsSection
      order={orderDetailsTransformer(order, t, format)}
      prevHref={`/${locale}/account/orders`}
      shipmentAddressLabel={t('shippingAddress')}
      shipmentMethodLabel={t('shippingMethod')}
      summaryTotalLabel={t('summaryTotal')}
      title={t('title', { orderNumber: id })}
    />
  );
}
