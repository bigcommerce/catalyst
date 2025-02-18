import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
// import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { FeaturedProductsCarousel } from '@/vibes/soul/sections/featured-products-carousel';
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

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// export async function generateMetadata(props: Props): Promise<Metadata> {
//   const { slug } = await props.params;

//   const variables = await cachedProductDataVariables(slug, props.searchParams);

//   const product = await getProductData(variables);

//   const { pageTitle, metaDescription, metaKeywords } = product.seo;
//   const { url, altText: alt } = product.defaultImage || {};

//   return {
//     title: pageTitle || product.name,
//     description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
//     keywords: metaKeywords ? metaKeywords.split(',') : null,
//     openGraph: url
//       ? {
//           images: [
//             {
//               url,
//               alt,
//             },
//           ],
//         }
//       : null,
//   };
// }

const searchParamsCache = createSearchParamsCache({
  [PaginationSearchParamNames.BEFORE]: parseAsString,
  [PaginationSearchParamNames.AFTER]: parseAsString,
});

export default async function Product(props: Props) {
  const { locale, slug } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Product');
  const productId = Number(slug);

  const streamableParsedSearchParams = Streamable.from(() =>
    searchParamsCache.parse(props.searchParams),
  );

  const streamableVariables = Streamable.from(async () =>
    cachedProductDataVariables(slug, props.searchParams),
  );
  const streamableProductData = Streamable.from(async () =>
    getProductData(await streamableVariables),
  );

  const streamableCtaDisabled = Streamable.from(async () => {
    const product = await streamableProductData;

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
  });

  const streamableCtaLabel = Streamable.from(async () => {
    const product = await streamableProductData;

    if (product.availabilityV2.status === 'Unavailable') {
      return t('ProductDetails.Submit.unavailable');
    }

    if (product.availabilityV2.status === 'Preorder') {
      return t('ProductDetails.Submit.preorder');
    }

    if (!product.inventory.isInStock) {
      return t('ProductDetails.Submit.outOfStock');
    }

    return t('ProductDetails.Submit.addToCart');
  });

  const streamableProduct = Streamable.from(async () => {
    const format = await getFormatter();
    const product = await streamableProductData;

    const images = removeEdgesAndNodes(product.images).map((image) => ({
      src: image.url,
      alt: image.altText,
    }));

    const customFields = removeEdgesAndNodes(product.customFields);

    const specifications = [
      {
        name: t('ProductDetails.Accordions.sku'),
        value: product.sku,
      },
      {
        name: t('ProductDetails.Accordions.weight'),
        value: `${product.weight?.value} ${product.weight?.unit}`,
      },
      {
        name: t('ProductDetails.Accordions.condition'),
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
              title: t('ProductDetails.Accordions.specifications'),
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
              title: t('Product.ProductDetails.Accordions.warranty'),
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
      description: (
        <div className="prose" dangerouslySetInnerHTML={{ __html: product.description }} />
      ),
      href: product.path,
      images: product.defaultImage
        ? [{ src: product.defaultImage.url, alt: product.defaultImage.altText }, ...images]
        : images,
      price: pricesTransformer(product.prices, format),
      subtitle: product.brand?.name,
      rating: product.reviewSummary.averageRating,
      accordions,
    };
  });

  return (
    <>
      <ProductDetail
        action={addToCart}
        additionalInformationLabel={t('ProductDetails.additionalInformation')}
        ctaDisabled={streamableCtaDisabled}
        ctaLabel={streamableCtaLabel}
        decrementLabel={t('ProductDetails.decreaseQuantity')}
        fields={Streamable.from(async () => {
          const product = await streamableProductData;

          return await productOptionsTransformer(product.productOptions);
        })}
        incrementLabel={t('ProductDetails.increaseQuantity')}
        prefetch={true}
        product={streamableProduct}
        quantityLabel={t('ProductDetails.quantity')}
        thumbnailLabel={t('ProductDetails.thumbnail')}
      />

      <FeaturedProductsCarousel
        cta={{ label: t('RelatedProducts.cta'), href: '/shop-all' }}
        emptyStateSubtitle={t('RelatedProducts.browseCatalog')}
        emptyStateTitle={t('RelatedProducts.noRelatedProducts')}
        nextLabel={t('RelatedProducts.nextProducts')}
        previousLabel={t('RelatedProducts.previousProducts')}
        products={Streamable.from(async () => {
          const format = await getFormatter();
          const product = await streamableProductData;

          const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

          return productCardTransformer(relatedProducts, format);
        })}
        scrollbarLabel={t('RelatedProducts.scrollbar')}
        title={t('RelatedProducts.title')}
      />

      <Reviews productId={productId} searchParams={streamableParsedSearchParams} />

      <Stream fallback={null} value={streamableProductData}>
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
