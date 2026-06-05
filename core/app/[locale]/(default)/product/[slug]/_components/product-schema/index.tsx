import { Product as ProductSchemaType, WithContext } from 'schema-dts';

import { PricingFragment } from '~/client/fragments/pricing';
import { FragmentOf } from '~/client/graphql';
import { TaxDisplay } from '~/data-transformers/prices-transformer';
import { pickPricesForTaxDisplay } from '~/lib/tax-pricing';

import { ProductSchemaFragment } from './fragment';

interface Props {
  product: FragmentOf<typeof ProductSchemaFragment> & FragmentOf<typeof PricingFragment>;
  taxDisplay?: TaxDisplay | null;
}

export const ProductSchema = ({ product, taxDisplay }: Props) => {
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

  const prices = pickPricesForTaxDisplay(product, taxDisplay);

  const priceSpecification = prices
    ? {
        '@type': 'PriceSpecification' as const,
        price: prices.price.value,
        priceCurrency: prices.price.currencyCode,
        ...(prices.priceRange.min.value !== prices.priceRange.max.value
          ? {
              minPrice: prices.priceRange.min.value,
              maxPrice: prices.priceRange.max.value,
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
