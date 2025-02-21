import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { getSessionCustomerAccessToken, getSessionUserDetails } from '~/auth';
import { Breadcrumbs } from '~/components/breadcrumbs';
import Promotion from '../../../../../components/ui/pdp/belami-promotion-banner-pdp';
import { Description } from './_components/description';
import { Details } from './_components/details';
import { Gallery } from './_components/gallery';
import { ProductViewed } from './_components/product-viewed';
import { Warranty } from './_components/warranty';
import { getProduct, getProductBySku } from './page-data';
import { imageManagerImageUrl } from '~/lib/store-assets';
import {
  CheckProductFreeShipping,
  GetCustomerGroupById,
  GetProductMetaFields,
  GetProductVariantMetaFields,
} from '~/components/management-apis';
import { ProductProvider } from '~/components/common-context/product-provider';
import { RelatedProducts } from '~/belami/components/product';
import { CollectionProducts } from '~/belami/components/product';
import { SiteVibesReviews } from '~/belami/components/sitevibes';
import { getRelatedProducts, getCollectionProducts } from '~/belami/lib/fetch-algolia-products';
import { getWishlists } from '../../account/(tabs)/wishlists/page-data';
import { commonSettinngs } from '~/components/common-functions';

import { cookies } from 'next/headers';
import { getPriceMaxRules } from '~/belami/lib/fetch-price-max-rules';
import { KlaviyoTrackViewedProduct } from '~/belami/components/klaviyo/klaviyo-track-viewed-product';

import { Page as MakeswiftPage } from '~/lib/makeswift';
import { calculateProductPrice } from '~/components/common-functions';
import { ProductSchema } from './_components/product-schema';
import { useTranslations } from 'next-intl';
import { getActivePromotions } from '~/belami/lib/fetch-promotions';
import { getMultipleChoiceOptions } from '~/components/graphql-apis';

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
        entityId: any;
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

interface CustomerGroup {
  discount_rules: Array<{
    amount: string;
    type: string;
    category_id: string;
    product_id: string;
    method: string;
  }>;
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
  const productSku: any = searchParams?.sku;
  const optionValueIds = getOptionValueIds({ searchParams });
  let product: any;
  if (productSku && optionValueIds.length === 0) {
    product = await getProductBySku({
      sku: productSku,
    });
  } else {
    product = await getProduct({
      entityId: productId,
      optionValueIds,
      useDefaultOptionSelections: optionValueIds.length === 0 ? true : undefined,
    });
  }

  if (!product) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};
  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph:
      url && typeof url === 'string'
        ? {
            images: [
              {
                url: url.replace('{:size}', '386x513'),
                alt,
              },
            ],
          }
        : null,
  };
}
export default async function ProductPage(props: Props) {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const sessionUser = await getSessionUserDetails();
    let customerGroupDetails: CustomerGroup = {
      discount_rules: [],
    };
    // console.log(JSON.stringify(customerGroupDetails, null, 2), 'FULL CUSTOMER GROUP DETAILS');
    if (sessionUser) {
      const customerGroupId = sessionUser?.customerGroupId;
      customerGroupDetails = await GetCustomerGroupById(customerGroupId);
    }
    const searchParams = await props.searchParams;
    const params = await props.params;
    const productSku: any = searchParams?.sku;

    if (!params || !searchParams) {
      return null;
    }

    const cookieStore = await cookies();
    const priceMaxCookie = cookieStore.get('pmx');
    const priceMaxTriggers = priceMaxCookie?.value
      ? JSON.parse(atob(priceMaxCookie?.value))
      : undefined;

    let priceMaxRules = null;
    const RESIDENTIAL_GROUP_ID = 6;
    const RESIDENTIAL_GROUP_NAME = 'Residential Member';
    const isNotAuthenticated = !sessionUser;
    const isPriceMaxEligible =
      isNotAuthenticated || (sessionUser && sessionUser.customerGroupId === RESIDENTIAL_GROUP_ID);

    if (priceMaxTriggers && Object.values(priceMaxTriggers).length > 0) {
      if (isPriceMaxEligible) {
        priceMaxRules = await getPriceMaxRules(priceMaxTriggers);

        const userStatus = isNotAuthenticated
          ? 'Non-authenticated visitor'
          : `${RESIDENTIAL_GROUP_NAME} (ID: ${RESIDENTIAL_GROUP_ID})`;

        if (priceMaxRules && priceMaxRules.length > 0) {
          priceMaxRules.forEach((rule) => {
            console.log(
              `Price Max Rule discount: ${rule.discount}% - Applied to SKUs: ${JSON.stringify(rule.skus)}`,
            );
          });
        }
      } else {
        console.log(
          `Price Max Rules not applied - user is in group ID ${sessionUser.customerGroupId} (not eligible)`,
        );
      }
    }

    const useDefaultPrices = !customerAccessToken;
    const { locale, slug } = params;

    setRequestLocale(locale);
    const t = await getTranslations('Product');
    const m = await getTranslations('productDetailDropdown');

    const productId = Number(slug);
    const optionValueIds = getOptionValueIds({ searchParams });

    let product: any;
    if (productSku && optionValueIds.length === 0) {
      product = await getProductBySku({
        sku: productSku,
      });
    } else {
      product = await getProduct({
        entityId: productId,
        optionValueIds,
        useDefaultOptionSelections: optionValueIds.length === 0 ? true : undefined,
      });
    }
    if (!product) {
      return notFound();
    }
  let selectedSku : any;
  let variantSku : any;
  const productsArray = [];
  productsArray.push(product);
  const combinedData = productsArray?.map((item: any) => {
    selectedSku = item?.sku;
    let deliveryMessageData = [
      ...(item?.variants?.edges?.flatMap((variant: any) => {
        variantSku = variant?.node?.sku;
        if (selectedSku === variantSku) {
        return variant?.node?.deliveryMessageData?.edges?.map((messageEdge: any) => messageEdge?.node?.value);
      }
       return [];
      }) || []),
      ...(item?.deliveryMessageParentData?.edges?.flatMap((variant: any) => {
        return variant?.node?.value
      }) || [])
    ];

    let closeOutValue = [
      ...(item?.variants?.edges?.flatMap((variant: any) => {
        if (selectedSku === variantSku) {
        return variant?.node?.closeOutData?.edges?.map((messageEdge: any) =>  messageEdge?.node?.value);
        }
        return [];
      }) || []),
      ...(item?.closeOutParentData?.edges?.flatMap((variant: any) => {
        return variant?.node?.value
      }) || [])
    ];

    return {
      selectedSku,
      variantSku,
      deliveryEstimatedTexts: deliveryMessageData || [],
      closeOutData: closeOutValue || []
    };
  });
  
    let swatchOptions: any;
    swatchOptions = await getMultipleChoiceOptions(productId);
    // Asset URLs
    const assets = {
      bannerIcon: imageManagerImageUrl('example-1.png', '50w'),
      galleryExpandIcon: imageManagerImageUrl('pan-zoom.png', '20w'),
      dropdownSheetIcon: imageManagerImageUrl('icons8-download-symbol-16.png', '15w'),
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

    const isVariantOption =
      product.productOptions?.edges?.some((option: any) => option.node.isVariantOption) || false;

    let variantMetaFields: MetaField[] = [];
    let variantMetaFields1: MetaField[] = [];
    const variants = product.variants.edges?.map((edge: any) => edge.node) || [];

    // Determine `selectedVariantId`
    const selectedVariantId =
      variants.find((v: any) => v.sku === product.sku)?.entityId || variants[0]?.entityId;

    if (isVariantOption && selectedVariantId) {
      // Fetch variant meta fields only if `isVariantOption` is true
      variantMetaFields = await GetProductVariantMetaFields(
        product.entityId,
        selectedVariantId,
        '',
      );
    }
    const productImagesNode = variantMetaFields.find((node) => node.namespace === 'product_images');
    const valueString = productImagesNode?.value; // Extract value if the node is found

    // const valueString = variantMetaFields[0]?.value;
    const baseURL = 'https://imgprd.1stoplighting.com';
    let extractedImagePairs: any;
    // Step 2: Parse the "value" field as JSON

    if (valueString) {
      try {
        const parsedValue = JSON.parse(valueString); // Parse the JSON string

        // Extract only objects that have 'url' and 'alt_text'
        extractedImagePairs = parsedValue
          ?.filter((item:any) => item?.url && item?.alt_text) // Ensure 'url' and 'alt_text' exist
          ?.map((item:any) => ({
            src: `${baseURL}${item?.url}`,
            altText: item?.alt_text || '',
          }));
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }

    // Function to extract nsoid or upid
    const extractIdentifier = (fields: MetaField[]) => {
      const nsoidField = fields.find((field) => field?.key === 'nsoid');
      const upidField = fields.find((field) => field?.key === 'upid');
      return nsoidField?.value || upidField?.value || null;
    };

    // **Final Logic:**
    // If `isVariantOption` is TRUE, use `variantMetaFields`
    // Otherwise, use `productMetaFields`
    const newIdentifier = isVariantOption
      ? extractIdentifier(variantMetaFields)
      : extractIdentifier(productMetaFields);

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

    const breadcrumbEntityIds =
      categoryWithMostBreadcrumbs?.breadcrumbs?.edges?.map((edge) => edge.node.entityId) || [];

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
                  entityId: '#',
                },
              },
            ].filter(Boolean),
          },
        }
      : null;

    const discountRules = customerGroupDetails?.discount_rules;

    const [updatedProduct] = await calculateProductPrice(
      product,
      'pdp',
      discountRules,
      breadcrumbEntityIds,
    );

    const productImages = removeEdgesAndNodes(product.images);
    var brandId = product?.brand?.entityId;
    var CommonSettinngsValues = await commonSettinngs([brandId]);

    const promotions = await getActivePromotions(true);

    const isFreeShipping = await CheckProductFreeShipping(product.entityId.toString());

    return (
      <div className="products-detail-page mx-auto max-w-[93.5%] pt-5">
        <div className="breadcrumbs-container hidden md:block">
          {categoryWithBreadcrumbs && (
            <div className="breadcrumb-row mb-5 flex justify-center xl:justify-start">
              <Breadcrumbs category={categoryWithBreadcrumbs} />
            </div>
          )}
        </div>

        <ProductProvider getMetaFields={productMetaFields}>
          <div className="mb-4 xl:mb-12 xl:gap-8">
            <div className="pdp-scroll xl:mb-[7em] xl:flex xl:w-[100%] xl:max-w-[100%] xl:gap-x-[3em]">
              <div className="Gallery relative xl:flex xl:w-[64%]">
                <div className="gallery-sticky-pop-up z-10 xl:sticky xl:top-0 xl:h-[100vh] xl:w-[100%]">
                  <Suspense fallback={<div>Loading gallery...</div>}>
                    <Gallery
                      product={product}
                      bannerIcon={assets.bannerIcon}
                      galleryExpandIcon={assets.galleryExpandIcon}
                      productMpn={product.mpn}
                      extractedImagePairs={extractedImagePairs}
                    />
                  </Suspense>
                </div>
              </div>
              
              <div className="PDP xl:relative xl:flex-1">
                <Details
                  promotions={promotions}
                  swatchOptions={swatchOptions}
                  isFreeShipping={isFreeShipping}
                  product={updatedProduct}
                  collectionValue={collectionValue}
                  dropdownSheetIcon={assets.dropdownSheetIcon}
                  cartHeader={assets.cartHeader}
                  couponIcon={assets.couponIcon}
                  paywithGoogle={assets.paywithGoogle}
                  payPal={assets.payPal}
                  requestQuote={assets.requestQuote}
                  closeIcon={assets.closeIcon}
                  blankAddImg={assets.blankAddImg}
                  getAllCommonSettinngsValues={CommonSettinngsValues}
                  productImages={productImages}
                  customerGroupDetails={customerGroupDetails}
                  categoryIds={breadcrumbEntityIds}
                  combinedData={combinedData[0]}
                  triggerLabel1={
                    <p className="pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#008BB7] underline underline-offset-4">
                      Shipping Policy
                    </p>
                  }
                  triggerLabel2={
                    <p className="pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#008BB7] underline underline-offset-4">
                      Return Policy
                    </p>
                  }
                  children1={<MakeswiftPage locale={locale} path="/content/shipping-flyout" />}
                  children2={<MakeswiftPage locale={locale} path="/content/returns-flyout" />}
                  children3={
                    <MakeswiftPage locale={locale} path="/content/request-a-quote-flyout" />
                  }
                  triggerLabel4={
                    <p className="pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#008BB7] underline underline-offset-4">
                      Learn More
                    </p>
                  }
                  children4={
                    <MakeswiftPage locale={locale} path="/content/certification-rating-flyout" />
                  }
                  triggerLabel5={
                    <p className="mt-4 w-full text-center text-base font-semibold text-gray-700 underline">
                      {m('warning')}
                    </p>
                  }
                  children5={<MakeswiftPage locale={locale} path="/content/information-flyout" />}
                  priceMaxRules={priceMaxRules}
                  sessionUser={sessionUser}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <hr className="mb-4 border border-gray-200" />
              <Description product={product} />
              <hr className="mb-[55px] mt-[20px] border border-gray-200" />
              {/*
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
              */}
              <CollectionProducts
                collection={collectionValue}
                products={collectionProducts.hits}
                useDefaultPrices={useDefaultPrices}
                priceMaxRules={priceMaxRules}
              />
              <Promotion />
              <RelatedProducts
                productId={product.entityId}
                products={relatedProducts}
                useDefaultPrices={useDefaultPrices}
                priceMaxRules={priceMaxRules}
                product={product}
                dropdownSheetIcon={assets.dropdownSheetIcon}
                cartHeader={assets.cartHeader}
                couponIcon={assets.couponIcon}
                paywithGoogle={assets.paywithGoogle}
                payPal={assets.payPal}
                requestQuote={assets.requestQuote}
                closeIcon={assets.closeIcon}
                blankAddImg={assets.blankAddImg}
                bannerIcon={assets.bannerIcon}
                galleryExpandIcon={assets.galleryExpandIcon}
                getAllCommonSettinngsValues={CommonSettinngsValues}
                productImages={productImages}
              />
              <Warranty product={product} />
              <SiteVibesReviews product={product} category={categoryWithBreadcrumbs} />
            </div>
          </div>

          <ProductViewed product={product} />
          <ProductSchema product={product} identifier={newIdentifier} productSku={productSku} />

          <KlaviyoTrackViewedProduct
            product={product}
            user={
              sessionUser && sessionUser.user && sessionUser.user?.email
                ? ({
                    email: sessionUser.user.email,
                    first_name: sessionUser.user?.firstName,
                    last_name: sessionUser.user?.lastName,
                  } as any)
                : null
            }
          />
        </ProductProvider>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4 text-center">
        <h2>Error loading product</h2>
        <p>Please try refreshing the page</p>
      </div>
    );
  }
}
