import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { ProductDetail } from '@/vibes/soul/sections/product-detail';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { productOptionsTransformer } from '~/data-transformers/product-options-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { addToCart } from './_actions/add-to-cart';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { PaginationSearchParamNames, Reviews } from './_components/reviews';
import { getProductData } from './page-data';

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

  const customFields = removeEdgesAndNodes(product.customFields);

  const specifications = [
    {
      name: t('sku'),
      value: product.sku,
    },
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
              <div className="prose @container">
                <dl className="flex flex-col gap-4">
                  {specifications.map((field, index) => (
                    <div className="grid grid-cols-1 gap-2 @lg:grid-cols-2" key={index}>
                      <dt>
                        <strong>{field.name}</strong>
                      </dt>
                      <dd>{field.value}</dd>
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
    href: product.path,
    images: product.defaultImage
      ? [
          { src: product.defaultImage.url, alt: product.defaultImage.altText },
          ...images.filter((image) => image.src !== product.defaultImage?.url),
        ]
      : images,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name,
    rating: product.reviewSummary.averageRating,
    accordions,
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

  if (!product.inventory.isInStock) {
    return t('outOfStock');
  }

  return t('addToCart');
};

const getCtaDisabled = async (props: Props) => {
  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);

  if (product.availabilityV2.status === 'Unavailable') {
    return true;
  }

  if (product.availabilityV2.status === 'Preorder') {
    return false;
  }

  if (!product.inventory.isInStock) {
    return true;
  }

  return false;
};

const getRelatedProducts = async (props: Props) => {
  const format = await getFormatter();

  const { slug } = await props.params;
  const variables = await cachedProductDataVariables(slug, props.searchParams);
  const product = await getProductData(variables);

  const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

  return productCardTransformer(relatedProducts, format);
};

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

  return (
    <>
      <ProductDetail
        action={addToCart}
        additionalInformationTitle={t('ProductDetails.additionalInformation')}
        ctaDisabled={Streamable.from(() => getCtaDisabled(props))}
        ctaLabel={Streamable.from(() => getCtaLabel(props))}
        decrementLabel={t('ProductDetails.decreaseQuantity')}
        emptySelectPlaceholder={t('ProductDetails.emptySelectPlaceholder')}
        fields={Streamable.from(() => getFields(props))}
        incrementLabel={t('ProductDetails.increaseQuantity')}
        prefetch={true}
        product={Streamable.from(() => getProduct(props))}
        quantityLabel={t('ProductDetails.quantity')}
        thumbnailLabel={t('ProductDetails.thumbnail')}
      />

      <FeaturedProductCarousel
        cta={{ label: t('RelatedProducts.cta'), href: '/shop-all' }}
        emptyStateSubtitle={t('RelatedProducts.browseCatalog')}
        emptyStateTitle={t('RelatedProducts.noRelatedProducts')}
        nextLabel={t('RelatedProducts.nextProducts')}
        previousLabel={t('RelatedProducts.previousProducts')}
        products={Streamable.from(() => getRelatedProducts(props))}
        scrollbarLabel={t('RelatedProducts.scrollbar')}
        title={t('RelatedProducts.title')}
      />

      <Reviews productId={productId} searchParams={parsedSearchParams} />

      <Stream fallback={null} value={Streamable.from(() => getProductData(variables))}>
        {(product) => (
          <>
            <ProductSchema product={product} />
            <ProductViewed product={product} />
          </>
        )}
      </Stream>
    </>
  );
}
