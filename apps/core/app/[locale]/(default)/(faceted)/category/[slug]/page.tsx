import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { getCategory } from '~/client/queries/get-category';
import { ProductCard } from '~/components/product-card';
import { LocaleType } from '~/i18n';

import { Breadcrumbs } from '../../_components/breadcrumbs';
import { FacetedSearch } from '../../_components/faceted-search';
import { MobileSideNav } from '../../_components/mobile-side-nav';
import { Pagination } from '../../_components/pagination';
import { SortBy } from '../../_components/sort-by';
import { SubCategories } from '../../_components/sub-categories';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

interface Props {
  params: {
    slug: string;
    locale: LocaleType;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryId = Number(params.slug);

  const category = await getCategory({
    categoryId,
  });

  const title = category?.name;

  return {
    title,
  };
}

export default async function Category({ params: { locale, slug }, searchParams }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Category' });
  const tPagination = await getTranslations({ locale, namespace: 'Pagination' });
  const messages = await getMessages({ locale });

  const categoryId = Number(slug);
  const search = await fetchFacetedSearch({ ...searchParams, category: [slug] });

  // We will only need a partial of this query to fetch the category name and breadcrumbs.
  // The rest of the arguments are useless at this point.
  const category = await getCategory({
    categoryId,
  });

  if (!category) {
    return notFound();
  }

  const productsCollection = search.products;
  const products = productsCollection.items;
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = productsCollection.pageInfo;

  return (
    <div>
      <Breadcrumbs breadcrumbs={category.breadcrumbs.items} category={category.name} />
      <NextIntlClientProvider
        locale={locale}
        messages={{ FacetedGroup: messages.FacetedGroup ?? {}, Product: messages.Product ?? {} }}
      >
        <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
          <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{category.name}</h1>

          <div className="flex flex-col items-center gap-3 whitespace-nowrap md:flex-row">
            <MobileSideNav>
              <FacetedSearch
                facets={search.facets.items}
                headingId="mobile-filter-heading"
                pageType="category"
              >
                <SubCategories categoryId={categoryId} />
              </FacetedSearch>
            </MobileSideNav>
            <div className="flex w-full flex-col items-start gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
              <SortBy />
              <div className="order-3 py-4 text-base font-semibold md:order-2 md:py-0">
                {t('sortBy', { items: productsCollection.collectionInfo?.totalItems ?? 0 })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
          <FacetedSearch
            className="mb-8 hidden lg:block"
            facets={search.facets.items}
            headingId="desktop-filter-heading"
            pageType="category"
          >
            <SubCategories categoryId={categoryId} />
          </FacetedSearch>

          <section aria-labelledby="product-heading" className="col-span-4 lg:col-span-3">
            <h2 className="sr-only" id="product-heading">
              {t('products')}
            </h2>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
              {products.map((product, index) => (
                <ProductCard
                  imagePriority={index <= 3}
                  imageSize="wide"
                  key={product.entityId}
                  product={product}
                />
              ))}
            </div>

            <Pagination
              endCursor={endCursor}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              nextLabel={tPagination('next')}
              prevLabel={tPagination('prev')}
              startCursor={startCursor}
            />
          </section>
        </div>
      </NextIntlClientProvider>
    </div>
  );
}
