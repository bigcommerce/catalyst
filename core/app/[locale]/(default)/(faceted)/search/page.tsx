import { getFormatter, getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';

import { getActivePromotions } from '~/belami/lib/fetch-promotions';
import { getPriceMaxRules } from '~/belami/lib/fetch-price-max-rules';
import { isBadUserAgent } from '~/belami/lib/bot-detection';

import { Breadcrumbs } from '~/components/breadcrumbs';

import { Search } from './search';

import { cookies, headers } from 'next/headers';

export async function generateMetadata() {
  const t = await getTranslations('Search');

  return {
    title: t('title'),
  };
}

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage(props: Props) {
  const searchParams = await props.searchParams;

  const cookieStore = await cookies();
  const priceMaxCookie = cookieStore.get('pmx');
  const priceMaxTriggers = priceMaxCookie?.value 
    ? JSON.parse(atob(priceMaxCookie?.value)) 
    : undefined;

  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country');
  const region = headersList.get('x-vercel-ip-country-region');
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const ua = headersList.get('user-agent') || '';

  const isBot = await isBadUserAgent(ua);
  const isCaliforniaIp = country === 'US' && region === 'CA';

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const t = await getTranslations('Search');
  const f = await getTranslations('FacetedGroup');

  const format = await getFormatter();

  const searchTerm = typeof searchParams.query === 'string' ? searchParams.query : undefined;

  const promotions = await getActivePromotions(true);
  const priceMaxRules = priceMaxTriggers && Object.values(priceMaxTriggers).length > 0 ? await getPriceMaxRules(priceMaxTriggers) : null;  

  /*
  if (!searchTerm) {
    return <EmptySearch />;
  }
  */

  return (
    <div className="group py-4 px-4 xl:px-12">
      <Breadcrumbs category={{breadcrumbs: {edges: [{node: {entityId: 0, name: t('title'), path: '/search'}}]}}} />
      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        {searchTerm 
          ? <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{t('searchResults')}: <b className="text-2xl font-bold lg:text-3xl">"{searchTerm}"</b></h1>
          : <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{t('title')}</h1>
        }
      </div>

      <Search 
        query={searchTerm} 
        promotions={promotions} 
        useDefaultPrices={useDefaultPrices} 
        priceMaxRules={priceMaxRules} 
        userContext={{
          isBot: isBot,
          isCaliforniaIp: isCaliforniaIp,
          ip: ip,
          ua: ua,
          isGuest: !customerAccessToken
        }}
      />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
