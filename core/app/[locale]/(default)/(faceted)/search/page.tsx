import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { EmptySearch } from '~/components/empty-search';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { redirectToCompare } from '../_actions/redirect-to-compare';
import { fetchFacetedSearch } from '../fetch-faceted-search';

import { getSessionCustomerAccessToken } from '~/auth';

import { getCompareProducts } from './page-data';
import { getPromotions } from '../fetch-promotions';

import { Breadcrumbs } from '~/components/breadcrumbs';
import { Search } from './search';


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

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const t = await getTranslations('Search');
  const f = await getTranslations('FacetedGroup');

  const format = await getFormatter();

  const searchTerm = typeof searchParams.query === 'string' ? searchParams.query : undefined;
  const promotions = await getPromotions();

  /*
  if (!searchTerm) {
    return <EmptySearch />;
  }
  */

  return (
    <div className="group py-4 px-4 xl:px-12">
      <Breadcrumbs category={{breadcrumbs: {edges: [{node: {name: t('title'), path: '/search'}}]}}} />
      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        {searchTerm 
          ? <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{t('searchResults')}: <b className="text-2xl font-bold lg:text-3xl">"{searchTerm}"</b></h1>
          : <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{t('title')}</h1>
        }
      </div>
      <Search query={searchTerm} promotions={promotions} useDefaultPrices={useDefaultPrices} />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
