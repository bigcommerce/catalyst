import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';

import { Breadcrumbs } from '~/components/breadcrumbs';

import Promotion from '../../../../../components/ui/pdp/belami-promotion-banner-pdp';
import { SimilarProducts as SimilarProducts0 } from '../../../../../components/ui/pdp/belami-similar-products-pdp';

import { Description } from './_components/description';
import { Details } from './_components/details';
import { Gallery } from './_components/gallery';
import { ProductViewed } from './_components/product-viewed';
//import { RelatedProducts } from './_components/related-products';
//import { Reviews } from './_components/reviews';
import { Warranty } from './_components/warranty';
import { getProduct } from './page-data';
import { ReviewSummary } from './_components/review-summary';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { GetProductMetaFields } from '~/components/management-apis';
import { ProductProvider } from '~/components/common-context/product-provider';

import { RelatedProducts } from './related-products';
import { CollectionProducts } from './collection-products';
//import { SimilarProducts } from './similar-products';
import { SitevibesReviews } from './sitevibes-reviews';

import { getRelatedProducts, getCollectionProducts } from './fetch-algolia-products';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
  const galleryExpandIcon = imageManagerImageUrl('vector.jpg', '20w'); // Set galleryExpandIcon here
  const dropdownSheetIcon = imageManagerImageUrl('icons8-download-symbol-16.png', '20w');

  const cartHeader = imageManagerImageUrl('cartheader.png', '20w');

  setRequestLocale(locale);

  const t = await getTranslations('Product');

  const productId = Number(slug);

  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: optionValueIds.length === 0 ? true : undefined,
  });

  const productMpn = product?.mpn;

  if (!product) {
    return notFound();
  }
  // Fetch the meta fields for the product
  let metaFields = await GetProductMetaFields(product.entityId, '');

  // Extract the collection value from meta fields
  let collectionValue = '';
  let collectionMetaField = metaFields?.find(
    (field: { key: string }) => field?.key === 'collection',
  );
  if (collectionMetaField?.value) {
    collectionValue = collectionMetaField.value; // Store the collection value
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

  const category = removeEdgesAndNodes(product.categories).at(0);
  if (category?.breadcrumbs?.edges && product?.mpn) {
    category.breadcrumbs.edges.push({ node: { name: product?.mpn, path: '#' } });
  }

  return (
    <>
      <div className="products-detail-page mx-auto max-w-[93.5%] pt-8">
        <ProductProvider getMetaFields={metaFields}>
          {category && <Breadcrumbs category={category} />}
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
                <span className="products-underline border-b border-black">
                  {product.brand?.name}
                </span>
              </span>

              {collectionMetaField?.value && (
                <span className="product-collection OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
                  from the{' '}
                  <span className="products-underline border-b border-black">
                    {collectionValue}
                  </span>{' '}
                  Family
                </span>
              )}
            </div>
            <ReviewSummary data={product} />
          </div>
          <div className="mb-4 mt-4 lg:grid lg:grid-cols-2 lg:gap-8 xl:mb-12">
            <Gallery
              productMpn={product.mpn} // Pass MPN from product
              product={product}
              bannerIcon={bannerIcon}
              galleryExpandIcon={galleryExpandIcon} // Pass galleryExpandIcon to Gallery component
            />
            <Details
              product={product}
              collectionValue={collectionValue}
              dropdownSheetIcon={dropdownSheetIcon}
              cartHeader={cartHeader}
            />
            <div className="lg:col-span-2">
              <Description product={product} />
              {/*
              <CollectionProducts collection={collectionValue} products={collectionProducts.hits} total={collectionProducts.total} moreLink={`${product.brand?.path ?? '/search'}?collection[0]=${collectionValue}`} useDefaultPrices={useDefaultPrices} />
              */}
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
              {/*
              <RelatedProducts
                productId={product.entityId}
                relatedProductArrow={relatedProductArrow}
              />
              */}
              <RelatedProducts
                productId={product.entityId}
                products={relatedProducts}
                useDefaultPrices={useDefaultPrices}
              />
              {/*
              <SimilarProducts productId={product.entityId} />
              */}
              {/*
              <SimilarProducts0 />
              */}
              <Warranty product={product} />
              <SitevibesReviews product={product} category={category} />
            </div>
          </div>
          <ProductViewed product={product} />
        </ProductProvider>
      </div>
    </>
  );
}
