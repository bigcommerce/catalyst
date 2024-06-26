import { getFormatter, getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const ProductPricesQuery = graphql(`
  query ProductPrices($entityId: Int!, $optionValueIds: [OptionValueId!]) {
    site {
      product(entityId: $entityId, optionValueIds: $optionValueIds) {
        prices {
          priceRange {
            min {
              value
            }
            max {
              value
            }
          }
          retailPrice {
            value
          }
          salePrice {
            value
          }
          basePrice {
            value
          }
          price {
            value
            currencyCode
          }
        }
      }
    }
  }
`);

type ProductPricesQueryVariables = VariablesOf<typeof ProductPricesQuery>;

const getProductPrices = cache(async (variables: ProductPricesQueryVariables) => {
  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: ProductPricesQuery,
    variables,
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return data.site.product;
});

export const Prices = async ({ entityId, optionValueIds }: ProductPricesQueryVariables) => {
  const product = await getProductPrices({ entityId, optionValueIds });
  const t = await getTranslations('Product.Details');
  const format = await getFormatter();

  const showPriceRange =
    product?.prices?.priceRange.min.value !== product?.prices?.priceRange.max.value;

  if (!product?.prices) {
    return null;
  }

  return (
    <div className="my-6 text-2xl font-bold lg:text-3xl">
      {showPriceRange ? (
        <span>
          {format.number(product.prices.priceRange.min.value, {
            style: 'currency',
            currency: product.prices.price.currencyCode,
          })}{' '}
          -{' '}
          {format.number(product.prices.priceRange.max.value, {
            style: 'currency',
            currency: product.prices.price.currencyCode,
          })}
        </span>
      ) : (
        <>
          {product.prices.retailPrice?.value !== undefined && (
            <span>
              {t('Prices.msrp')}:{' '}
              <span className="line-through">
                {format.number(product.prices.retailPrice.value, {
                  style: 'currency',
                  currency: product.prices.price.currencyCode,
                })}
              </span>
              <br />
            </span>
          )}
          {product.prices.salePrice?.value !== undefined &&
          product.prices.basePrice?.value !== undefined ? (
            <>
              <span>
                {t('Prices.was')}:{' '}
                <span className="line-through">
                  {format.number(product.prices.basePrice.value, {
                    style: 'currency',
                    currency: product.prices.price.currencyCode,
                  })}
                </span>
              </span>
              <br />
              <span>
                {t('Prices.now')}:{' '}
                {format.number(product.prices.salePrice.value, {
                  style: 'currency',
                  currency: product.prices.price.currencyCode,
                })}
              </span>
            </>
          ) : (
            product.prices.price.value && (
              <span>
                {format.number(product.prices.price.value, {
                  style: 'currency',
                  currency: product.prices.price.currencyCode,
                })}
              </span>
            )
          )}
        </>
      )}
    </div>
  );
};
