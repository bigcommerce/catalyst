import { getFormatter } from 'next-intl/server';

import { graphql, ResultOf } from '~/client/graphql';
import { ProductCard as ComponentProductCard, Price } from '~/components/ui/product-card';

import { AddToCart } from './add-to-cart';
import { AddToCartFragment } from './add-to-cart/fragment';

export const ProductCardFragment = graphql(
  `
    fragment ProductCardFragment on Product {
      entityId
      name
      defaultImage {
        altText
        url: urlTemplate
      }
      path
      brand {
        name
        path
      }
      reviewSummary {
        numberOfReviews
        averageRating
      }
      prices {
        price {
          value
          currencyCode
        }
        basePrice {
          value
          currencyCode
        }
        retailPrice {
          value
          currencyCode
        }
        salePrice {
          value
          currencyCode
        }
        priceRange {
          min {
            value
            currencyCode
          }
          max {
            value
            currencyCode
          }
        }
      }
      ...AddToCartFragment
    }
  `,
  [AddToCartFragment],
);

interface Props {
  product: ResultOf<typeof ProductCardFragment>;
  imageSize?: 'tall' | 'wide' | 'square';
  imagePriority?: boolean;
  showCompare?: boolean;
  showCart?: boolean;
}

export const ProductCard = async ({
  product,
  imageSize = 'square',
  imagePriority = false,
  showCart = true,
  showCompare = true,
}: Props) => {
  const { name, entityId, defaultImage, brand, path, prices } = product;

  const format = await getFormatter();

  const formattedPrice = (): Price | null => {
    if (!prices) {
      return null;
    }

    const isPriceRange = prices.priceRange.min.value !== prices.priceRange.max.value;
    const isSalePrice = prices.salePrice?.value !== prices.basePrice?.value;

    if (isPriceRange) {
      return {
        type: 'range',
        min: format.number(prices.priceRange.min.value, {
          style: 'currency',
          currency: prices.price.currencyCode,
        }),
        max: format.number(prices.priceRange.max.value, {
          style: 'currency',
          currency: prices.price.currencyCode,
        }),
      };
    }

    if (isSalePrice && prices.salePrice && prices.basePrice) {
      return {
        type: 'sale',
        originalAmount: format.number(prices.basePrice.value, {
          style: 'currency',
          currency: prices.price.currencyCode,
        }),
        amount: format.number(prices.salePrice.value, {
          style: 'currency',
          currency: prices.price.currencyCode,
        }),
        msrp:
          prices.retailPrice && prices.retailPrice.value !== prices.basePrice.value
            ? format.number(prices.retailPrice.value, {
                style: 'currency',
                currency: prices.price.currencyCode,
              })
            : undefined,
      };
    }

    return {
      type: 'fixed',
      amount: format.number(prices.price.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
      msrp:
        prices.retailPrice && prices.retailPrice.value !== prices.price.value
          ? format.number(prices.retailPrice.value, {
              style: 'currency',
              currency: prices.price.currencyCode,
            })
          : undefined,
    };
  };

  return (
    <ComponentProductCard
      addToCart={showCart && <AddToCart data={product} />}
      image={defaultImage}
      imagePriority={imagePriority}
      imageSize={imageSize}
      link={path}
      price={formattedPrice() ?? undefined}
      productId={entityId}
      showCompare={showCompare}
      subtitle={brand?.name}
      title={name}
    />
  );
};
