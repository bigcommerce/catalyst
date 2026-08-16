import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';
import { cache } from 'react';
import { preload } from 'react-dom';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { productOptionsTransformer } from '~/data-transformers/product-options-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { ProductDetail } from '~/lib/makeswift/components/product-detail';
import { client } from '~/client';

import { addToCart } from './_actions/add-to-cart';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { PaginationSearchParamNames, Reviews } from './_components/reviews';
import { QnAList } from './_components/qna-list';
import { getProductData } from './page-data';
import { auth } from '~/auth';
import { B2BOnly } from '~/components/b2b/visibility';
import { B2BProductWidget } from '~/components/b2b/product-widget';
import { generateSSOUrl } from '~/lib/b2b/sso';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';

const cachedProductDataVariables = cache(
  async (productId: string, searchParams: Props['searchParams']) => {
    const options = await searchParams;
    const optionValueIds = Object.keys(options)
      .map((option) => ({
        optionEntityId: Number(option),
        valueEntityId: Number(options[option]),
      }))
      .filter(
        (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
      );

    const currencyCode = await getPreferredCurrencyCode();

    return {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
      currencyCode,
    };
  },
);

const getProduct = async (props: Props) => {
  const t = await getTranslations('Product.ProductDetails.Accordions');

  const format = await getFormatter();

  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);

  const images = removeEdgesAndNodes(product.images).map((image) => ({
    src: image.url,
    alt: image.altText,
  }));

  const videos = removeEdgesAndNodes(product.videos).map((video) => ({
    title: video.title,
    url: video.url,
  }));

  const customFields = removeEdgesAndNodes(product.customFields);

  const specifications = [
    // {
    //   name: t('sku'),
    //   value: product.sku,
    // },
    {
      name: t('weight'),
      value: `${product.weight?.value} ${product.weight?.unit}`,
    },
    {
      name: t('condition'),
      value: product.condition,
    },
    ...customFields.map((field) => ({
      name: field.name,
      value: field.value,
    })),
  ];

  const accordions = [
    ...(specifications.length
      ? [
          {
            title: t('specifications'),
            content: (
              <div className="@container">
                <dl className="flex flex-col gap-2">
                  {specifications.map((field, index) => (
                    <div className="grid grid-cols-1 gap-0 @lg:grid-cols-2" key={index}>
                      <dt>
                        <strong>{field.name}</strong>
                      </dt>
                      <dd className="pl-0">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ),
          },
        ]
      : []),
    ...(product.warranty
      ? [
          {
            title: t('warranty'),
            content: (
              <div className="prose" dangerouslySetInnerHTML={{ __html: product.warranty }} />
            ),
          },
        ]
      : []),
  ];

  return {
    id: product.entityId.toString(),
    title: product.name,
    description: <div dangerouslySetInnerHTML={{ __html: product.description }} />,
    plainTextDescription: product.plainTextDescription,
    href: product.path,
    images: product.defaultImage
      ? [
          { src: product.defaultImage.url, alt: product.defaultImage.altText },
          ...images.filter((image) => image.src !== product.defaultImage?.url),
        ]
      : images,
    videos,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name,
    subtitleHref: product.brand?.path,
    // rating: product.reviewSummary.averageRating, // Hidden until reviews are collected
    accordions,
    inventory_tracking: product.inventory_tracking,
    sku: product.sku,
    bcPriceValue: product.prices?.price?.value ?? null,
  };
};

const getFields = async (props: Props) => {
  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);

  return await productOptionsTransformer(product.productOptions);
};

const getCtaLabel = async (props: Props) => {
  const t = await getTranslations('Product.ProductDetails.Submit');

  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);

  if (product.availabilityV2.status === 'Unavailable') {
    return t('unavailable');
  }

  if (product.availabilityV2.status === 'Preorder') {
    return t('preorder');
  }

  // Allow adding out-of-stock items to cart (backorder)
  return t('addToCart');
};

const getCtaDisabled = async (props: Props) => {
  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);

  // Only disable if product is truly unavailable
  // Allow adding out-of-stock items (backorder) and preorders
  if (product.availabilityV2.status === 'Unavailable') {
    return true;
  }

  return false;
};

const getDocuments = async (props: Props): Promise<Array<{ label: string; url: string }>> => {
  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);
  const metafields = removeEdgesAndNodes(product.documentsMetafields);
  const field = metafields.find((f) => f.key === 'documents');
  if (!field) return [];
  try {
    return JSON.parse(field.value);
  } catch {
    return [];
  }
};

const getQnA = async (props: Props): Promise<Array<{ question: string; answer: string }>> => {
  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);
  const metafields = removeEdgesAndNodes(product.qnaMetafields);
  const field = metafields.find((f) => f.key === 'qa_data');
  if (!field) return [];
  try {
    return JSON.parse(field.value);
  } catch {
    return [];
  }
};

async function getProductPromotionBadges(): Promise<Map<number, string>> {
  try {
    // Check if fetchPromotions method exists
    if (typeof client.fetchPromotions !== 'function') {
      return new Map();
    }

    const response = await client.fetchPromotions();

    if (!response?.data) {
      return new Map();
    }

    const productBadges = new Map<number, string>();

    // Extract all product IDs that have gift promotions
    response.data.forEach((promo: any) => {
      if (promo.status === 'ENABLED' && promo.rules) {
        promo.rules.forEach((rule: any) => {
          // Check if this rule has a gift item
          if (rule.action?.gift_item) {
            // Get the products this rule applies to
            const products = rule.condition?.cart?.items?.products;
            if (products && Array.isArray(products)) {
              products.forEach((productId: number) => productBadges.set(productId, promo.display_name));
            }
          }
        });
      }
    });

    return productBadges;
  } catch (error) {
    console.error('Error fetching product promotions for badges:', error);
    return new Map();
  }
}

const getRelatedProducts = async (props: Props) => {
  const format = await getFormatter();

  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);

  const relatedProducts = removeEdgesAndNodes(product.relatedProducts);
  const categories = removeEdgesAndNodes(product.categories);
  const categoryRelatedProducts = categories[0] ? removeEdgesAndNodes(categories[0].products) : [];

  const productBadges = await getProductPromotionBadges();

  return productCardTransformer(
    relatedProducts.length > 0 ? relatedProducts : categoryRelatedProducts,
    format,
    productBadges,
  );
};

async function getBreadcrumbs(props: Props): Promise<Breadcrumb[]> {
  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);

  const category = removeEdgesAndNodes(product.categories)[0];

  if (!category || !category.breadcrumbs || category.breadcrumbs.edges === null) {
    return [];
  }

  return removeEdgesAndNodes(category!.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));
}

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;

  const variables = await cachedProductDataVariables(slug, props.searchParams);

  const product = await getProductData(variables);

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  const title =
    pageTitle && pageTitle.length >= 10 && pageTitle.length <= 60
      ? pageTitle
      : `${product.name} | Buy Online - Quality & Value`;
  const description =
    metaDescription && metaDescription.length <= 160
      ? metaDescription
      : `${product.plainTextDescription.slice(0, 150)}...`;
  const siteName = process.env.NEXT_PUBLIC_STORE_NAME || 'Catalyst Store';
  const pageUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}${product.path}`
    : `https://gitool.com${product.path}`;
  return {
    title,
    description,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName,
      images: url
        ? [
            {
              url,
              alt,
            },
          ]
        : [
            {
              url: process.env.NEXT_PUBLIC_OG_IMAGE || '/favicon.ico',
              alt: `${siteName} Logo`,
            },
          ],
    },
  };
}

const searchParamsCache = createSearchParamsCache({
  [PaginationSearchParamNames.BEFORE]: parseAsString,
  [PaginationSearchParamNames.AFTER]: parseAsString,
});

export default async function Product(props: Props) {
  const { locale, slug } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Product');

  const productId = Number(slug);
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const parsedSearchParams = searchParamsCache.parse(props.searchParams);

  // Preload the LCP product image so the browser fetches it immediately from
  // the initial HTML, before the client-side gallery hydrates.
  const productData = await getProduct(props);
  const firstImageSrc = productData.images[0]?.src;
  if (firstImageSrc) {
    const sizes = [384, 640, 750, 1080, 1200];
    const imageSrcSet = sizes
      .map((w) => `${firstImageSrc.replace('{:size}', `${w}w`)} ${w}w`)
      .join(', ');
    preload(firstImageSrc.replace('{:size}', '640w'), {
      as: 'image',
      // @ts-ignore — fetchPriority is supported in React 18.3+ / Next.js 14+
      fetchPriority: 'high',
      imageSrcSet,
      imageSizes: '(min-width: 42rem) 50vw, 100vw',
    });
  }

  return (
    <>
      {/* ProductSchema component below handles schema.org structured data with actual product data */}
      <SectionLayout hideOverflow={true}>
        <ProductDetail
          action={addToCart}
          breadcrumbs={Streamable.from(() => getBreadcrumbs(props))}
          additionaInformationTitle={t('ProductDetails.additionalInformation')}
          ctaDisabled={Streamable.from(() => getCtaDisabled(props))}
          ctaLabel={Streamable.from(() => getCtaLabel(props))}
          decrementLabel={t('ProductDetails.decreaseQuantity')}
          fields={Streamable.from(() => getFields(props))}
          incrementLabel={t('ProductDetails.increaseQuantity')}
          prefetch={true}
          product={Streamable.from(() => getProduct(props))}
          productId={productId}
          quantityLabel={t('ProductDetails.quantity')}
          thumbnailLabel={t('ProductDetails.thumbnail')}
          inventoryTracking={Streamable.from(() =>
            getProduct(props).then((p) => p.inventory_tracking),
          )}
          inventoryLevel={Streamable.from(() =>
            getProductData(variables).then((p) => p.inventory_level),
          )}
          sku={Streamable.from(() => getProduct(props).then((p) => p.sku))}
          promotions={Streamable.from(() => getProductData(variables).then((p) => p.promotions))}
          giftProducts={Streamable.from(() =>
            getProductData(variables).then((p) => p.giftProducts),
          )}
          documents={Streamable.from(() => getDocuments(props))}
          formSlot={
            <B2BOnly>
              <Stream
                fallback={<div className="h-48 animate-pulse rounded-xl bg-contrast-100" />}
                value={Streamable.from(async () => {
                  const [p, session] = await Promise.all([getProduct(props), auth()]);
                  const portalBase = process.env.B2B_PORTAL_URL ?? '';
                  const email = session?.user?.email;
                  const ssoUrl = email && portalBase ? generateSSOUrl(email, portalBase) : portalBase;
                  return { ...p, ssoUrl };
                })}
              >
                {(p) => <B2BProductWidget bcPrice={p.bcPriceValue} bcProductId={productId} portalUrl={p.ssoUrl} productName={p.title} productUrl={p.href} sku={p.sku} />}
              </Stream>
            </B2BOnly>
          }
        />

        <Stream fallback={null} value={Streamable.from(() => getQnA(props))}>
          {(items) =>
            items.length > 0 && (
              <div className="mx-auto max-w-screen-2xl px-4 pb-20 @xl:px-6 @4xl:px-8">
                <h2 className="mb-8 font-heading text-2xl font-medium">Questions & Answers</h2>
                <QnAList items={items} />
              </div>
            )
          }
        </Stream>

        <div className="mb-20">
          <FeaturedProductCarousel
            cta={{ label: t('RelatedProducts.cta'), href: '/shop' }}
            emptyStateSubtitle={t('RelatedProducts.browseCatalog')}
            emptyStateTitle={t('RelatedProducts.noRelatedProducts')}
            nextLabel={t('RelatedProducts.nextProducts')}
            previousLabel={t('RelatedProducts.previousProducts')}
            products={Streamable.from(() => getRelatedProducts(props))}
            scrollbarLabel={t('RelatedProducts.scrollbar')}
            title={t('RelatedProducts.title')}
          />
        </div>
        {/* Hidden until reviews are collected */}
        {/* <Reviews productId={productId} searchParams={parsedSearchParams} /> */}

        <Stream fallback={null} value={Streamable.from(() => getProductData(variables))}>
          {(product) => (
            <>
              <ProductSchema product={product} />
              <ProductViewed product={product} />
            </>
          )}
        </Stream>
      </SectionLayout>
    </>
  );
}
