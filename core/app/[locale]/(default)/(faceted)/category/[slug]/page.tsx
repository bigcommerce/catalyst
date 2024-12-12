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

import { getSessionCustomerAccessToken } from '~/auth';

import { CategoryViewed } from './_components/category-viewed';
import { EmptyState } from './_components/empty-state';
import { SubCategories } from './_components/sub-categories';
import { getCategoryPageData } from './page-data';

import { getPromotions } from '../../fetch-promotions';

import { Category } from './category';

import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { defaultLocale } from '~/i18n/routing';
import { client } from '~/lib/makeswift/client';
import '~/lib/makeswift/components';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const { locale, slug } = params;

  setRequestLocale(locale);

  const t = await getTranslations('Category');

  const categoryId = Number(slug);

  const { category, categoryTree } = await getCategoryPageData({ categoryId });

  if (!category) {
    return notFound();
  }

  const snapshot = await client.getPageSnapshot(category.path, {
    siteVersion: await getSiteVersion(),
    locale: locale === defaultLocale ? undefined : locale,
  });

  const promotions = await getPromotions();

  return (
    <div className="group py-4 px-4 xl:px-12">
      <Breadcrumbs category={category} />
      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{category.name}</h1>
      </div>

      {!!snapshot &&
        <MakeswiftPage snapshot={snapshot} />
      }

      <Category category={category} promotions={promotions} useDefaultPrices={useDefaultPrices} />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
