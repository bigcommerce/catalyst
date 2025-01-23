import { getFormatter, getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';

import { getActivePromotions } from '~/belami/lib/fetch-promotions';

import { Breadcrumbs } from '~/components/breadcrumbs';
import { QuickDeliveryProducts } from './quick-delivery-products';


export async function generateMetadata() {
  const t = await getTranslations('QuickDeliveryProducts');

  return {
    title: t('title'),
  };
}

export default async function QuickDeliveryProductsPage() {

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const t = await getTranslations('QuickDeliveryProducts');

  const promotions = await getActivePromotions(true);

  return (
    <div className="group py-4 px-4 xl:px-12">
      <Breadcrumbs category={{breadcrumbs: {edges: [{node: {name: t('title'), path: '/quick-delivery-products'}}]}}} />
      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{t('title')}</h1>
      </div>
      <QuickDeliveryProducts promotions={promotions} useDefaultPrices={useDefaultPrices} />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
