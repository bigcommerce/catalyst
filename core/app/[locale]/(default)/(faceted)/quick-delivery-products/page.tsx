import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';

import { getActivePromotions } from '~/belami/lib/fetch-promotions';

import { Breadcrumbs } from '~/components/breadcrumbs';

import { QuickDeliveryProducts } from './quick-delivery-products';

import { cookies } from 'next/headers';

import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { defaultLocale } from '~/i18n/routing';
import { client } from '~/lib/makeswift/client';
import '~/lib/makeswift/components';

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  const t = await getTranslations('QuickDeliveryProducts');

  return {
    title: t('title'),
  };
}

export default async function QuickDeliveryProductsPage(props: Props) {

  const searchParams = await props.searchParams;
  const params = await props.params;

  const cookieStore = await cookies();
  const priceMaxCookie = cookieStore.get('pmx');
  const priceMaxTriggers = priceMaxCookie?.value 
    ? JSON.parse(atob(priceMaxCookie?.value)) 
    : undefined;

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const { locale } = params;

  setRequestLocale(locale);

  const t = await getTranslations('QuickDeliveryProducts');

  const snapshot = await client.getPageSnapshot('/quick-delivery-products', {
    siteVersion: await getSiteVersion(),
    locale: locale === defaultLocale ? undefined : locale,
  });

  const promotions = await getActivePromotions(true);

  return (
    <div className="group py-4 px-4 xl:px-12">
      <Breadcrumbs category={{breadcrumbs: {edges: [{node: {name: t('title'), path: '/quick-delivery-products'}}]}}} />
      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{t('title')}</h1>
      </div>

      {!!snapshot &&
        <MakeswiftPage snapshot={snapshot} />
      }

      <QuickDeliveryProducts promotions={promotions} useDefaultPrices={useDefaultPrices} priceMaxTriggers={priceMaxTriggers} />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
