import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { getSessionCustomerAccessToken } from '~/auth';
import Link from 'next/link';
import { Breadcrumbs } from '~/components/breadcrumbs';
import Promotion from '../../../../../components/ui/pdp/belami-promotion-banner-pdp';
import { SimilarProducts } from '../../../../../components/ui/pdp/belami-similar-products-pdp';
import { Description } from './_components/description';
import { Details } from './_components/details';
import { Gallery } from './_components/gallery';
import { ProductViewed } from './_components/product-viewed';
import { Warranty } from './_components/warranty';
import { getProduct } from './page-data';
import { ReviewSummary } from './_components/review-summary';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { GetProductMetaFields, GetProductVariantMetaFields } from '~/components/management-apis';
import { ProductProvider } from '~/components/common-context/product-provider';
import { RelatedProducts } from './related-products';
import { CollectionProducts } from './collection-products';
import { SitevibesReviews } from './sitevibes-reviews';
import { getRelatedProducts, getCollectionProducts } from '~/belami/lib/fetch-algolia-products';
import { getWishlists } from '../../account/(tabs)/wishlists/page-data';

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

interface MetaField {
  key: string;
  value: string;
  namespace: string;
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
  try {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const customerAccessToken = await getSessionCustomerAccessToken();

    if (!params || !searchParams) {
      console.error('Missing required params:', { params, searchParams });
      return null;
    }

    const useDefaultPrices = !customerAccessToken;
    const { locale, slug } = params;

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

    // Add this after the wishlist fetch
    const wishlistData = await getWishlists({
      cursor: null,
      limit: 50,
    }).catch((error) => {
      console.error('Error fetching wishlists:', error);
      return { wishlists: [] };
    });

    // Asset URLs
    const assets = {
      bannerIcon: imageManagerImageUrl('example-1.png', '50w'),
      galleryExpandIcon: imageManagerImageUrl('vector.jpg', '20w'),
      dropdownSheetIcon: imageManagerImageUrl('icons8-download-symbol-16.png', '20w'),
      cartHeader: imageManagerImageUrl('cartheader.png', '20w'),
      couponIcon: imageManagerImageUrl('vector-2-.png', '20w'),
      paywithGoogle: imageManagerImageUrl('apple-xxl.png', '20w'),
      payPal: imageManagerImageUrl('fill-11.png', '20w'),
      requestQuote: imageManagerImageUrl('waving-hand-1-.png', '30w'),
      closeIcon: imageManagerImageUrl('close.png', '14w'),
      blankAddImg: imageManagerImageUrl('notneeded-1.jpg', '150w'),
    };

    // Get MetaFields
    const productMetaFields = await GetProductMetaFields(product.entityId, '');
    let variantMetaFields: MetaField[] = [];

    const selectedVariantId = product.variants.edges?.[0]?.node.entityId;
    if (selectedVariantId) {
      variantMetaFields = await GetProductVariantMetaFields(
        product.entityId,
        selectedVariantId,
        '',
      );
    }

    // Process Collection Value
    let collectionValue = '';
    let collectionMetaField = variantMetaFields?.find(
      (field: MetaField) => field?.key?.toLowerCase() === 'collection',
    );

    if (!collectionMetaField?.value) {
      collectionMetaField = productMetaFields?.find(
        (field: MetaField) => field?.key?.toLowerCase() === 'collection',
      );
    }

    if (collectionMetaField?.value) {
      collectionValue = collectionMetaField.value;
    }

    // Process Review Ratings
    const averageRatingMetaField = productMetaFields?.find(
      (field: MetaField) => field?.key === 'sv-average-rating',
    );
    const totalReviewsMetaField = productMetaFields?.find(
      (field: MetaField) => field?.key === 'sv-total-reviews',
    );

    if (averageRatingMetaField && totalReviewsMetaField) {
      product.reviewSummary.numberOfReviews = totalReviewsMetaField.value ?? 0;
      product.reviewSummary.averageRating = averageRatingMetaField.value ?? 0;
    }

    // Get Related Products
    const relatedProducts = await getRelatedProducts(product.entityId);
    const collectionProducts = await getCollectionProducts(
      product.entityId,
      product.brand?.name ?? '',
      collectionValue,
    );

    // Process Categories
    const categories = removeEdgesAndNodes(product.categories) as CategoryNode[];
    const categoryWithMostBreadcrumbs = categories.reduce((longest, current) => {
      const longestLength = longest?.breadcrumbs?.edges?.length || 0;
      const currentLength = current?.breadcrumbs?.edges?.length || 0;
      return currentLength > longestLength ? current : longest;
    }, categories[0]);

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

    const productImages = removeEdgesAndNodes(product.images);

    return (
      <div className="products-detail-page mx-auto max-w-[93.5%] pt-8">
        <ProductProvider getMetaFields={productMetaFields}>
          <div className="breadcrumbs-container">
            {categoryWithBreadcrumbs && (
              <div className="breadcrumb-row">
                <Breadcrumbs category={categoryWithBreadcrumbs} />
              </div>
            )}
          </div>

          <div className="mb-4 mt-4 lg:grid lg:grid-cols-2 lg:gap-8 xl:mb-12">
            <Suspense fallback={<div>Loading gallery...</div>}>
              <Gallery
                product={product}
                bannerIcon={assets.bannerIcon}
                galleryExpandIcon={assets.galleryExpandIcon}
                productMpn={product.mpn}
                wishlistData={{
                  wishlists: wishlistData?.wishlists || [],
                  product: {
                    entityId: product.entityId,
                    variantEntityId: product.variants.edges?.[0]?.node.entityId,
                    name: product.name,
                    path: product.path,
                    images: productImages,
                    brand: product.brand,
                    prices: product.prices,
                    rating: product.reviewSummary?.averageRating,
                    reviewCount: product.reviewSummary?.numberOfReviews,
                  },
                }}
              />
            </Suspense>

            <Details
              product={product}
              collectionValue={collectionValue}
              dropdownSheetIcon={assets.dropdownSheetIcon}
              cartHeader={assets.cartHeader}
              couponIcon={assets.couponIcon}
              paywithGoogle={assets.paywithGoogle}
              payPal={assets.payPal}
              requestQuote={assets.requestQuote}
              closeIcon={assets.closeIcon}
              blankAddImg={assets.blankAddImg}
              productImages={productImages}
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
    );
  } catch (error) {
    console.error('Error in ProductPage:', error);
    return (
      <div className="p-4 text-center">
        <h2>Error loading product</h2>
        <p>Please try refreshing the page</p>
      </div>
    );
  }
}
