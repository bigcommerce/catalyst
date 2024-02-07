import { Product as ProductSchemaType, WithContext } from 'schema-dts';

import { getProduct } from '~/client/queries/get-product';

export const ProductSchema = ({ product }: { product: Awaited<ReturnType<typeof getProduct>> }) => {
  if (product === null) return null;

  /* TODO: use common default image when product has no images */
  const image = product.defaultImage ? { image: product.defaultImage.url } : null;

  const sku = product.sku ? { sku: product.sku } : null;
  const gtin = product.gtin ? { gtin: product.gtin } : null;
  const mpn = product.mpn ? { mpn: product.mpn } : null;

  const brand = product.brand
    ? {
        '@type': 'Brand' as const,
        url: product.brand.path,
        name: product.brand.name,
      }
    : null;

  const aggregateRating =
    product.reviewSummary.numberOfReviews > 0
      ? {
          '@type': 'AggregateRating' as const,
          ratingValue: product.reviewSummary.averageRating,
          reviewCount: product.reviewSummary.numberOfReviews,
        }
      : null;

  const priceSpecification = product.prices
    ? {
        '@type': 'PriceSpecification' as const,
        price: product.prices.price.value,
        priceCurrency: product.prices.price.currencyCode,
        ...(product.prices.priceRange.min.value !== product.prices.priceRange.max.value
          ? {
              minPrice: product.prices.priceRange.min.value,
              maxPrice: product.prices.priceRange.max.value,
            }
          : null),
      }
    : null;

  enum ItemCondition {
    NEW = 'https://schema.org/NewCondition',
    USED = 'https://schema.org/UsedCondition',
    REFURBISHED = 'https://schema.org/RefurbishedCondition',
  }

  const itemCondition = ItemCondition[product.condition ?? 'NEW'];

  enum Availability {
    Preorder = 'PreOrder',
    Unavailable = 'OutOfStock',
    Available = 'InStock',
  }

  const availability = Availability[product.availabilityV2.status];

  const productSchema: WithContext<ProductSchemaType> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: product.path,
    description: product.plainTextDescription,
    ...(brand && { brand }),
    ...(aggregateRating && { aggregateRating }),
    ...image,
    ...sku,
    ...gtin,
    ...mpn,
    offers: {
      '@type': 'Offer',
      ...(priceSpecification && { priceSpecification }),
      itemCondition,
      availability,
      url: product.path,
    },
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      type="application/ld+json"
    />
  );
};
