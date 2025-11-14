import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { ProductDetail } from '@/vibes/soul/sections/product-detail';
import { getSessionCustomerAccessToken } from '~/auth';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { productOptionsTransformer } from '~/data-transformers/product-options-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { addToCart } from './_actions/add-to-cart';
import { ProductAnalyticsProvider } from './_components/product-analytics-provider';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { Reviews } from './_components/reviews';
import { WishlistButton } from './_components/wishlist-button';
import { WishlistButtonForm } from './_components/wishlist-button/form';
import {
  getProduct,
  getProductPageMetadata,
  getProductPricingAndRelatedProducts,
  getStreamableInventorySettingsQuery,
  getStreamableProduct,
} from './page-data';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const productId = Number(slug);

  const product = await getProductPageMetadata(productId, customerAccessToken);

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

export default async function Product({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const detachedWishlistFormId = 'product-add-to-wishlist-form';

  setRequestLocale(locale);

  const t = await getTranslations('Product');
  const format = await getFormatter();

  const productId = Number(slug);

  const baseProduct = await getProduct(productId, customerAccessToken);

  if (!baseProduct) {
    return notFound();
  }

  const streamableProduct = Streamable.from(async () => {
    const options = await searchParams;

    const optionValueIds = Object.keys(options)
      .map((option) => ({
        optionEntityId: Number(option),
        valueEntityId: Number(options[option]),
      }))
      .filter(
        (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
      );

    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
    };

    const product = await getStreamableProduct(variables, customerAccessToken);

    if (!product) {
      return notFound();
    }

    return {
      ...product,
      variants: removeEdgesAndNodes(product.variants).map((variant) => {
        const byLocation = variant.inventory?.byLocation ?? { edges: [] };

        return {
          ...variant,
          inventory: {
            ...variant.inventory,
            byLocation: removeEdgesAndNodes(byLocation),
          },
        };
      }),
    };
  });

  const streamableProductSku = Streamable.from(async () => (await streamableProduct).sku);

  const streamableProductPricingAndRelatedProducts = Streamable.from(async () => {
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

    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
      currencyCode,
    };

    return await getProductPricingAndRelatedProducts(variables, customerAccessToken);
  });

  const streamablePrices = Streamable.from(async () => {
    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return null;
    }

    return pricesTransformer(product.prices, format) ?? null;
  });

  const streamableImages = Streamable.from(async () => {
    const product = await streamableProduct;

    const images = removeEdgesAndNodes(product.images)
      .filter((image) => image.url !== product.defaultImage?.url)
      .map((image) => ({
        src: image.url,
        alt: image.altText,
      }));

    return product.defaultImage
      ? [{ src: product.defaultImage.url, alt: product.defaultImage.altText }, ...images]
      : images;
  });

  const streameableCtaLabel = Streamable.from(async () => {
    const product = await streamableProduct;

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
    const product = await streamableProduct;

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

  const streamableInventorySettings = Streamable.from(async () => {
    return await getStreamableInventorySettingsQuery(customerAccessToken);
  });

  const streamableStockDisplayData = Streamable.from(async () => {
    const [product, inventorySetting] = await Streamable.all([
      streamableProduct,
      streamableInventorySettings,
    ]);

    if (!inventorySetting) {
      return null;
    }

    const {
      showOutOfStockMessage,
      stockLevelDisplay,
      defaultOutOfStockMessage,
      showBackorderAvailabilityPrompt,
      showBackorderMessage,
      showQuantityOnBackorder,
      backorderAvailabilityPrompt,
    } = inventorySetting;

    // Handle out of stock case
    if (!product.inventory.isInStock) {
      if (!showOutOfStockMessage) {
        return null;
      }

      return {
        stockLevelMessage: defaultOutOfStockMessage,
        backorderAvailabilityPrompt: null,
      };
    }

    // Don't show stock level
    if (stockLevelDisplay === 'DONT_SHOW') {
      return null;
    }

    // Calculate and display stock level
    const { availableToSell, warningLevel, availableOnHand } = product.inventory.aggregated ?? {};
    const showsBackorderInfo =
      showBackorderAvailabilityPrompt || showBackorderMessage || showQuantityOnBackorder;

    // Determine the stock quantity to display
    const stockQuantity = showsBackorderInfo ? availableOnHand : availableToSell;

    // If no stock quantity and we're showing backorder info, show 0
    if (!stockQuantity && showsBackorderInfo) {
      return {
        stockLevelMessage: t('ProductDetails.currentStock', { quantity: 0 }),
        backorderAvailabilityPrompt: null,
      };
    }

    // No stock quantity to display
    if (!stockQuantity) {
      return null;
    }

    // Apply "show when low" logic
    if (stockLevelDisplay === 'SHOW_WHEN_LOW') {
      if (!warningLevel || stockQuantity > warningLevel) {
        return null;
      }
    }

    // Conditions that prevent showing backorder prompt
    const isPromptDisabled = !showBackorderAvailabilityPrompt;
    const hasNoBackorderAvailability =
      !product.inventory.aggregated?.availableForBackorder &&
      !product.inventory.aggregated?.unlimitedBackorder;

    if (isPromptDisabled || hasNoBackorderAvailability) {
      return {
        stockLevelMessage: t('ProductDetails.currentStock', { quantity: stockQuantity }),
        backorderAvailabilityPrompt: null,
      };
    }

    return {
      stockLevelMessage: t('ProductDetails.currentStock', { quantity: stockQuantity }),
      backorderAvailabilityPrompt,
    };
  });

  const streamableBackorderDisplayData = Streamable.from(async () => {
    const [product, inventorySetting] = await Streamable.all([
      streamableProduct,
      streamableInventorySettings,
    ]);

    const inventoryData = {
      availableOnHand: product.inventory.aggregated?.availableOnHand ?? 0,
      availableForBackorder: product.inventory.aggregated?.availableForBackorder ?? 0,
      unlimitedBackorder: !!product.inventory.aggregated?.unlimitedBackorder,
    };

    // No inventory settings available
    if (!inventorySetting) {
      return {
        ...inventoryData,
        showQuantityOnBackorder: false,
        backorderMessage: null,
      };
    }

    const { showQuantityOnBackorder, showBackorderMessage } = inventorySetting;

    // No backorder available
    const hasBackorder =
      inventoryData.availableForBackorder > 0 || inventoryData.unlimitedBackorder;

    if (!hasBackorder || !showBackorderMessage) {
      return {
        ...inventoryData,
        showQuantityOnBackorder: showQuantityOnBackorder && hasBackorder,
        backorderMessage: null,
      };
    }

    // Currently, supporting backorder messages for simple products only
    if (product.variants.length !== 1) {
      return {
        ...inventoryData,
        showQuantityOnBackorder,
        backorderMessage: null,
      };
    }

    const baseVariant = product.variants.find((variant) => variant.sku === product.sku);
    const inventoryByLocation = baseVariant?.inventory.byLocation.at(0);

    return {
      ...inventoryData,
      showQuantityOnBackorder,
      backorderMessage: inventoryByLocation?.backorderMessage || null,
    };
  });

  const streameableAccordions = Streamable.from(async () => {
    const product = await streamableProduct;

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
    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return [];
    }

    const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

    return productCardTransformer(relatedProducts, format);
  });

  const streamableMinQuantity = Streamable.from(async () => {
    const product = await streamableProduct;

    return product.minPurchaseQuantity;
  });

  const streamableMaxQuantity = Streamable.from(async () => {
    const product = await streamableProduct;

    return product.maxPurchaseQuantity;
  });

  const streamableAnalyticsData = Streamable.from(async () => {
    const [extendedProduct, pricingProduct] = await Streamable.all([
      streamableProduct,
      streamableProductPricingAndRelatedProducts,
    ]);

    return {
      id: extendedProduct.entityId,
      name: extendedProduct.name,
      sku: extendedProduct.sku,
      brand: extendedProduct.brand?.name ?? '',
      price: pricingProduct?.prices?.price.value ?? 0,
      currency: pricingProduct?.prices?.price.currencyCode ?? '',
    };
  });

  return (
    <>
      <ProductAnalyticsProvider data={streamableAnalyticsData}>
        <ProductDetail
          action={addToCart}
          additionalActions={
            <WishlistButton
              formId={detachedWishlistFormId}
              productId={productId}
              productSku={streamableProductSku}
            />
          }
          additionalInformationTitle={t('ProductDetails.additionalInformation')}
          ctaDisabled={streameableCtaDisabled}
          ctaLabel={streameableCtaLabel}
          decrementLabel={t('ProductDetails.decreaseQuantity')}
          emptySelectPlaceholder={t('ProductDetails.emptySelectPlaceholder')}
          fields={productOptionsTransformer(baseProduct.productOptions)}
          incrementLabel={t('ProductDetails.increaseQuantity')}
          prefetch={true}
          product={{
            id: baseProduct.entityId.toString(),
            title: baseProduct.name,
            description: <div dangerouslySetInnerHTML={{ __html: baseProduct.description }} />,
            href: baseProduct.path,
            images: streamableImages,
            price: streamablePrices,
            subtitle: baseProduct.brand?.name,
            rating: baseProduct.reviewSummary.averageRating,
            accordions: streameableAccordions,
            minQuantity: streamableMinQuantity,
            maxQuantity: streamableMaxQuantity,
            stockDisplayData: streamableStockDisplayData,
            backorderDisplayData: streamableBackorderDisplayData,
          }}
          quantityLabel={t('ProductDetails.quantity')}
          thumbnailLabel={t('ProductDetails.thumbnail')}
        />
      </ProductAnalyticsProvider>

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

      <Reviews productId={productId} searchParams={searchParams} />

      <Stream
        fallback={null}
        value={Streamable.from(async () =>
          Streamable.all([streamableProduct, streamableProductPricingAndRelatedProducts]),
        )}
      >
        {([extendedProduct, pricingProduct]) => (
          <>
            <ProductSchema
              product={{ ...extendedProduct, prices: pricingProduct?.prices ?? null }}
            />
            <ProductViewed
              product={{ ...extendedProduct, prices: pricingProduct?.prices ?? null }}
            />
          </>
        )}
      </Stream>

      <WishlistButtonForm
        formId={detachedWishlistFormId}
        productId={productId}
        productSku={streamableProductSku}
        searchParams={searchParams}
      />
    </>
  );
}
