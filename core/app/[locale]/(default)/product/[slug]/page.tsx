import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { ProductDetail } from '@/vibes/soul/sections/product-detail';
import { getSessionCustomerAccessToken } from '~/auth';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { productOptionsTransformer } from '~/data-transformers/product-options-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { addToCart } from './_actions/add-to-cart';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { loadReviewsPaginationSearchParams, Reviews } from './_components/reviews';
import { getProductMetadata, getProductPageData, getStaticProductPageData } from './page-data';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;

  const productId = Number(slug);

  const product = await getProductMetadata(productId);

  if (!product) {
    return notFound();
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

export default async function Product(props: Props) {
  const { locale, slug } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Product');
  const format = await getFormatter();

  const productId = Number(slug);
  const staticProduct = await getStaticProductPageData(productId);

  if (!staticProduct) {
    return notFound();
  }

  const streamableProductData = Streamable.from(async () => {
    const options = await props.searchParams;

    const optionValueIds = Object.keys(options)
      .map((option) => ({
        optionEntityId: Number(option),
        valueEntityId: Number(options[option]),
      }))
      .filter(
        (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
      );

    const currencyCode = await getPreferredCurrencyCode();

    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
      currencyCode,
    };

    const customerAccessToken = await getSessionCustomerAccessToken();

    const product = await getProductPageData(variables, customerAccessToken);

    if (!product) {
      return notFound();
    }

    return product;
  });

  const streamablePrice = Streamable.from(async () => {
    const product = await streamableProductData;

    return pricesTransformer(product.prices, format) ?? null;
  });

  const streamableImages = Streamable.from(async () => {
    const product = await streamableProductData;

    const images = removeEdgesAndNodes(product.images).map((image) => ({
      src: image.url,
      alt: image.altText,
    }));

    return product.defaultImage
      ? [{ src: product.defaultImage.url, alt: product.defaultImage.altText }, ...images]
      : images;
  });

  const streamableFields = Streamable.from(async () => {
    const product = await streamableProductData;

    return productOptionsTransformer(product.productOptions);
  });

  const streameableCtaLabel = Streamable.from(async () => {
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

  const streameableCtaDisabled = Streamable.from(async () => {
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

  const streameableAccordions = Streamable.from(async () => {
    const product = await streamableProductData;

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

    return [
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
              title: t('ProductDetails.Accordions.warranty'),
              content: (
                <div className="prose" dangerouslySetInnerHTML={{ __html: product.warranty }} />
              ),
            },
          ]
        : []),
    ];
  });

  const streameableRelatedProducts = Streamable.from(async () => {
    const product = await streamableProductData;

    const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

    return productCardTransformer(relatedProducts, format);
  });

  const streamableReviewsPaginationSearchParams = Streamable.from(() =>
    loadReviewsPaginationSearchParams(props.searchParams),
  );

  return (
    <>
      <ProductDetail
        action={addToCart}
        additionalInformationTitle={t('ProductDetails.additionalInformation')}
        ctaDisabled={streameableCtaDisabled}
        ctaLabel={streameableCtaLabel}
        decrementLabel={t('ProductDetails.decreaseQuantity')}
        emptySelectPlaceholder={t('ProductDetails.emptySelectPlaceholder')}
        fields={streamableFields}
        incrementLabel={t('ProductDetails.increaseQuantity')}
        prefetch={true}
        product={{
          id: staticProduct.entityId.toString(),
          title: staticProduct.name,
          description: (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: staticProduct.description }}
            />
          ),
          href: staticProduct.path,
          images: streamableImages,
          price: streamablePrice,
          subtitle: staticProduct.brand?.name,
          rating: staticProduct.reviewSummary.averageRating,
          accordions: streameableAccordions,
        }}
        quantityLabel={t('ProductDetails.quantity')}
        thumbnailLabel={t('ProductDetails.thumbnail')}
      />

      <FeaturedProductCarousel
        cta={{ label: t('RelatedProducts.cta'), href: '/shop-all' }}
        emptyStateSubtitle={t('RelatedProducts.browseCatalog')}
        emptyStateTitle={t('RelatedProducts.noRelatedProducts')}
        nextLabel={t('RelatedProducts.nextProducts')}
        previousLabel={t('RelatedProducts.previousProducts')}
        products={streameableRelatedProducts}
        scrollbarLabel={t('RelatedProducts.scrollbar')}
        title={t('RelatedProducts.title')}
      />

      <Reviews productId={productId} searchParams={streamableReviewsPaginationSearchParams} />

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
