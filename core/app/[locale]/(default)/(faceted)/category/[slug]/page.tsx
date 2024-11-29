import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Breadcrumbs } from '~/components/breadcrumbs';
import { ProductCard } from '~/components/product-card';
import { Pagination } from '~/components/ui/pagination';

import { FacetedSearch } from '../../_components/faceted-search';
import { MobileSideNav } from '../../_components/mobile-side-nav';
import { SortBy } from '../../_components/sort-by';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { CategoryViewed } from './_components/category-viewed';
import { EmptyState } from './_components/empty-state';
import { SubCategories } from './_components/sub-categories';
import { getCategoryPageData } from './page-data';

import { Category } from './category';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/*
TODO: Move to separate file...
*/
const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
const client = process.env.BIGCOMMERCE_API_CLIENT || '';
const tokenRest = process.env.BIGCOMMERCE_ACCESS_TOKEN || '';
const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

export async function getPromotions() {
  const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/promotions?channels=${channelId}&sort=priority&status=ENABLED&redemption_type=AUTOMATIC`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "X-Auth-Client": client,
      "X-Auth-Token": tokenRest,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    cache: 'force-cache',
    //next: { revalidate: 3600 }
  });

  const data = await response.json();

  return data.data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryId = Number(slug);

  const data = await getCategoryPageData({
    categoryId,
  });

  const category = data.category;

  if (!category) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { locale, slug } = params;

  setRequestLocale(locale);

  const t = await getTranslations('Category');

  const categoryId = Number(slug);

  const { category, categoryTree } = await getCategoryPageData({ categoryId });

  if (!category) {
    return notFound();
  }

  const promotions = await getPromotions();

  return (
    <div className="group py-4 px-4 xl:px-12">
      <Breadcrumbs category={category} />
      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{category.name}</h1>
      </div>
      <Category category={category} promotions={promotions} />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
export const runtime = 'edge';
