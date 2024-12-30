import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import Link from 'next/link';

import { Breadcrumbs } from '~/components/breadcrumbs';
import Promotion from '../../../../../components/ui/pdp/belami-promotion-banner-pdp';
import { SimilarProducts as SimilarProducts0 } from '../../../../../components/ui/pdp/belami-similar-products-pdp';

import { Description } from './_components/description';
import { Details } from './_components/details';
import { Gallery } from './_components/gallery';
import { ProductViewed } from './_components/product-viewed';
import { Warranty } from './_components/warranty';
import { getProduct } from './page-data';
import { ReviewSummary } from './_components/review-summary';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { GetProductMetaFields } from '~/components/management-apis';
import { ProductProvider } from '~/components/common-context/product-provider';

import { RelatedProducts } from './related-products';
import { CollectionProducts } from './collection-products';
import { SitevibesReviews } from './sitevibes-reviews';

import { getRelatedProducts, getCollectionProducts } from '../../../../../belami/lib/fetch-algolia-products';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface CategoryNode {
  name: string;
  path: string | null;
  breadcrumbs?: {
    edges: Array<{
      node: {
        name: string;
        path: string | null;
      };
    }> | null;
  };
}

function getOptionValueIds({ searchParams }: { searchParams: Awaited<Props['searchParams']> }) {
  const { slug, ...options } = searchParams;

  return Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const productId = Number(params.slug);
  const optionValueIds = getOptionValueIds({ searchParams });
  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: optionValueIds.length === 0 ? true : undefined,
  });

  if (!product) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: url
      ? {
          images: [
            {
              url,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const { locale, slug } = params;

  const bannerIcon = imageManagerImageUrl('example-1.png', '50w');
  const relatedProductArrow = imageManagerImageUrl('vector-8-.png', '30w');
  const galleryExpandIcon = imageManagerImageUrl('vector.jpg', '20w');
  const dropdownSheetIcon = imageManagerImageUrl('icons8-download-symbol-16.png', '20w');
  const cartHeader = imageManagerImageUrl('cartheader.png', '20w');
  const couponIcon = imageManagerImageUrl('vector-2-.png', '20w');
  const paywithGoogle = imageManagerImageUrl('apple-xxl.png', '20w');
  const payPal = imageManagerImageUrl('fill-11.png', '20w');
  const requestQuote = imageManagerImageUrl('vector-6-.png', '30w');
  const closeIcon = imageManagerImageUrl('close.png', '14w');
  setRequestLocale(locale);

  const t = await getTranslations('Product');

  const productId = Number(slug);
  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: optionValueIds.length === 0 ? true : undefined,
  });

  if (!product) {
    return notFound();
  }

  let metaFields = await GetProductMetaFields(product.entityId, '');

  let collectionValue = '';
  let collectionMetaField = metaFields?.find(
    (field: { key: string }) => field?.key === 'collection',
  );
  if (collectionMetaField?.value) {
    collectionValue = collectionMetaField.value;
  }

  const relatedProducts = await getRelatedProducts(product.entityId);
  const collectionProducts = await getCollectionProducts(
    product.entityId,
    product.brand?.name ?? '',
    collectionValue,
  );

  const averageRatingMetaField = metaFields?.find(
    (field: { key: string }) => field?.key === 'sv-average-rating',
  );

  const totalReviewsMetaField = metaFields?.find(
    (field: { key: string }) => field?.key === 'sv-total-reviews',
  );

  if (averageRatingMetaField && totalReviewsMetaField) {
    product.reviewSummary.numberOfReviews = totalReviewsMetaField.value ?? 0;
    product.reviewSummary.averageRating = averageRatingMetaField.value ?? 0;
  }

  // Get categories and create breadcrumbs
  const categories = removeEdgesAndNodes(product.categories) as CategoryNode[];

  // Find the category with the longest breadcrumb trail
  const categoryWithMostBreadcrumbs = categories.reduce((longest, current) => {
    const longestLength = longest?.breadcrumbs?.edges?.length || 0;
    const currentLength = current?.breadcrumbs?.edges?.length || 0;
    return currentLength > longestLength ? current : longest;
  }, categories[0]);

  // Create breadcrumbs structure only for the most complete path
  const categoryWithBreadcrumbs = categoryWithMostBreadcrumbs
    ? {
        ...categoryWithMostBreadcrumbs,
        breadcrumbs: {
          edges: [
            ...(categoryWithMostBreadcrumbs?.breadcrumbs?.edges || []),
            {
              node: {
                name: product.mpn || '',
                path: '#',
              },
            },
          ].filter(Boolean),
        },
      }
    : null;

  return (
    <>
      <div className="products-detail-page mx-auto max-w-[93.5%] pt-8">
        <ProductProvider getMetaFields={metaFields}>
          {/* Breadcrumbs Section */}
          <div className="breadcrumbs-container">
            {categoryWithBreadcrumbs && (
              <div className="breadcrumb-row">
                <Breadcrumbs category={categoryWithBreadcrumbs} />
              </div>
            )}
          </div>

          <div className="main-product-details hidden">
            <h2 className="product-name mb-3 text-center text-[1.25rem] font-medium leading-[2rem] tracking-[0.15px] sm:text-center md:mt-6 lg:text-left xl:mt-0 xl:text-[1.5rem] xl:font-normal xl:leading-[2rem]">
              {product.name}
            </h2>

            <div className="items-center space-x-1 text-center lg:text-left xl:text-left">
              <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
                SKU: <span>{product.mpn}</span>
              </span>
              <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
                by{' '}
                <Link
                  href={product.brand?.path ?? ''}
                  className="products-underline border-b border-black"
                >
                  {product.brand?.name}
                </Link>
              </span>

              {collectionMetaField?.value && (
                <span className="product-collection OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
                  from the{' '}
                  <Link
                    href={`/search?brand_name[0]=${encodeURIComponent(product.brand?.name ?? '')}&collection[0]=${encodeURIComponent(collectionValue)}`}
                    className="products-underline border-b border-black"
                  >
                    {collectionValue}
                  </Link>{' '}
                  Family
                </span>
              )}
            </div>
            <ReviewSummary data={product} />
          </div>

          <div className="mb-4 mt-4 lg:grid lg:grid-cols-2 lg:gap-8 xl:mb-12">
            <Gallery
              productMpn={product.mpn}
              product={product}
              bannerIcon={bannerIcon}
              galleryExpandIcon={galleryExpandIcon}
            />
            <Details
              product={product}
              collectionValue={collectionValue}
              dropdownSheetIcon={dropdownSheetIcon}
              cartHeader={cartHeader}
              couponIcon={couponIcon}
              paywithGoogle={paywithGoogle}
              payPal={payPal}
              requestQuote={requestQuote}
              closeIcon={closeIcon}
            />
            <div className="lg:col-span-2">
              <Description product={product} />
              <CollectionProducts
                collection={collectionValue}
                products={collectionProducts.hits}
                total={
                  collectionProducts.hits && collectionProducts.total > 10
                    ? collectionProducts.total - collectionProducts.hits.length
                    : 0
                }
                moreLink={`/search?brand_name[0]=${product.brand?.name ?? ''}&collection[0]=${collectionValue}`}
                useDefaultPrices={useDefaultPrices}
              />
              <Promotion />
              <RelatedProducts
                productId={product.entityId}
                products={relatedProducts}
                useDefaultPrices={useDefaultPrices}
              />
              <Warranty product={product} />
              <SitevibesReviews product={product} category={categoryWithBreadcrumbs} />
            </div>
          </div>
          <ProductViewed product={product} />
        </ProductProvider>
      </div>
    </>
  );
}
