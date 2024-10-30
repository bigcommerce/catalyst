import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import * as z from 'zod';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { SearchForm } from '~/components/search-form';
import { Button } from '~/components/ui/button';
import { Rating } from '~/components/ui/rating';
import { cn } from '~/lib/utils';

import { AddToCart } from './_components/add-to-cart';
import { AddToCartFragment } from './_components/add-to-cart/fragment';

const MAX_COMPARE_LIMIT = 10;

const CompareParamsSchema = z.object({
  ids: z
    .union([z.string(), z.array(z.string()), z.undefined()])
    .transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === 'string') {
        return [...value.split(',')];
      }

      return undefined;
    })
    .transform((value) => value?.map((id) => parseInt(id, 10))),
});

const ComparePageQuery = graphql(
  `
    query ComparePageQuery($entityIds: [Int!], $first: Int) {
      site {
        products(entityIds: $entityIds, first: $first) {
          edges {
            node {
              entityId
              name
              path
              brand {
                name
              }
              defaultImage {
                altText
                url: urlTemplate(lossy: true)
              }
              reviewSummary {
                numberOfReviews
                averageRating
              }
              productOptions(first: 3) {
                edges {
                  node {
                    entityId
                  }
                }
              }
              description
              inventory {
                aggregated {
                  availableToSell
                }
              }
              ...AddToCartFragment
              ...PricingFragment
            }
          }
        }
      }
    }
  `,
  [AddToCartFragment, PricingFragment],
);

export async function generateMetadata() {
  const t = await getTranslations('Compare');

  return {
    title: t('title'),
  };
}

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Compare({ searchParams }: Props) {
  const t = await getTranslations('Compare');
  const format = await getFormatter();

  const customerId = await getSessionCustomerId();

  const parsed = CompareParamsSchema.parse(searchParams);
  const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));

  const { data } = await client.fetch({
    document: ComparePageQuery,
    variables: {
      entityIds: productIds ?? [],
      first: productIds?.length ? MAX_COMPARE_LIMIT : 0,
    },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const products = removeEdgesAndNodes(data.site.products).map((product) => ({
    ...product,
    productOptions: removeEdgesAndNodes(product.productOptions),
  }));

  if (!products.length) {
    return (
      <div className="flex w-full justify-center py-16 align-middle">
        <div className="flex max-w-2xl flex-col gap-8 pb-8">
          <h1 className="text-4xl font-black lg:text-5xl">{t('nothingToCompare')}</h1>
          <p className="text-lg">{t('helpingText')}</p>
          <SearchForm />
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="pb-8 text-4xl font-black lg:text-5xl">
        {t('heading', { quantity: products.length })}
      </h1>

      <div className="-mx-6 overflow-auto overscroll-x-contain px-4 sm:-mx-10 sm:px-10 lg:-mx-12 lg:px-12">
        <table className="mx-auto w-full max-w-full table-fixed text-base md:w-fit">
          <caption className="sr-only">{t('Table.caption')}</caption>

          <colgroup>
            <col className="w-80" span={products.length} />
          </colgroup>

          <thead>
            <tr>
              {products.map((product) => (
                <th className="sr-only" key={product.entityId} scope="col">
                  {product.name}
                </th>
              ))}
            </tr>
            <tr>
              {products.map((product) => {
                if (product.defaultImage) {
                  return (
                    <td className="px-4" key={product.entityId}>
                      <Link aria-label={product.name} href={product.path}>
                        <BcImage
                          alt={product.defaultImage.altText}
                          height={300}
                          src={product.defaultImage.url}
                          width={300}
                        />
                      </Link>
                    </td>
                  );
                }

                return (
                  <td className="px-4" key={product.entityId}>
                    <Link aria-label={product.name} href={product.path}>
                      <div className="flex aspect-square items-center justify-center bg-gray-200 text-gray-500">
                        <p className="text-lg">{t('Table.noImage')}</p>
                      </div>
                    </Link>
                  </td>
                );
              })}
            </tr>
            <tr>
              {products.map((product) => (
                <td className="px-4 pt-4 text-gray-500" key={product.entityId}>
                  {product.brand?.name}
                </td>
              ))}
            </tr>
            <tr>
              {products.map((product) => (
                <td className="px-4 align-top text-xl font-bold lg:text-2xl" key={product.entityId}>
                  <Link href={product.path}>{product.name}</Link>
                </td>
              ))}
            </tr>
            <tr>
              {products.map((product) => {
                const showPriceRange =
                  product.prices?.priceRange.min.value !== product.prices?.priceRange.max.value;

                return (
                  <td className="px-4 py-4 align-bottom text-base" key={product.entityId}>
                    {product.prices && (
                      <p className="w-36 shrink-0">
                        {showPriceRange ? (
                          <>
                            {format.number(product.prices.priceRange.min.value, {
                              style: 'currency',
                              currency: product.prices.price.currencyCode,
                            })}{' '}
                            -{' '}
                            {format.number(product.prices.priceRange.max.value, {
                              style: 'currency',
                              currency: product.prices.price.currencyCode,
                            })}
                          </>
                        ) : (
                          <>
                            {product.prices.retailPrice?.value !== undefined && (
                              <>
                                {t('Table.Prices.msrp')}:{' '}
                                <span className="line-through">
                                  {format.number(product.prices.retailPrice.value, {
                                    style: 'currency',
                                    currency: product.prices.price.currencyCode,
                                  })}
                                </span>
                                <br />
                              </>
                            )}
                            {product.prices.salePrice?.value !== undefined &&
                            product.prices.basePrice?.value !== undefined ? (
                              <>
                                {t('Table.Prices.was')}:{' '}
                                <span className="line-through">
                                  {format.number(product.prices.basePrice.value, {
                                    style: 'currency',
                                    currency: product.prices.price.currencyCode,
                                  })}
                                </span>
                                <br />
                                <>
                                  {t('Table.Prices.now')}:{' '}
                                  {format.number(product.prices.price.value, {
                                    style: 'currency',
                                    currency: product.prices.price.currencyCode,
                                  })}
                                </>
                              </>
                            ) : (
                              product.prices.price.value && (
                                <>
                                  {format.number(product.prices.price.value, {
                                    style: 'currency',
                                    currency: product.prices.price.currencyCode,
                                  })}
                                </>
                              )
                            )}
                          </>
                        )}
                      </p>
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              {products.map((product) => {
                if (product.productOptions.length) {
                  return (
                    <td className="border-b px-4 pb-12" key={product.entityId}>
                      <Button aria-label={product.name} asChild className="hover:text-white">
                        <Link href={product.path}>{t('Table.viewOptions')}</Link>
                      </Button>
                    </td>
                  );
                }

                return (
                  <td className="border-b px-4 pb-12" key={product.entityId}>
                    <AddToCart data={product} />
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="absolute mt-6">
              <th className="sticky start-0 top-0 m-0 ps-4 text-start" id="product-description">
                {t('Table.description')}
              </th>
            </tr>
            <tr>
              {products.map((product) => (
                <td
                  className="border-b px-4 pb-8 pt-20"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  headers="product-description"
                  key={product.entityId}
                />
              ))}
            </tr>
            <tr className="absolute mt-6">
              <th className="sticky start-0 top-0 m-0 ps-4 text-start" id="product-rating">
                {t('Table.rating')}
              </th>
            </tr>
            <tr>
              {products.map((product) => (
                <td
                  className="border-b px-4 pb-8 pt-20"
                  headers="product-rating"
                  key={product.entityId}
                >
                  <p
                    className={cn(
                      'flex flex-nowrap text-primary',
                      product.reviewSummary.numberOfReviews === 0 && 'text-gray-400',
                    )}
                  >
                    <Rating
                      aria-label={
                        product.reviewSummary.numberOfReviews === 0
                          ? `${product.name} has no rating specified`
                          : `${product.name} rating is ${product.reviewSummary.averageRating} out of 5 stars`
                      }
                      rating={product.reviewSummary.averageRating}
                    />
                  </p>
                </td>
              ))}
            </tr>
            <tr className="absolute mt-6">
              <th className="sticky start-0 top-0 m-0 ps-4 text-start" id="product-availability">
                {t('Table.availability')}
              </th>
            </tr>
            <tr>
              {products.map((product) => (
                <td
                  className="border-b px-4 pb-8 pt-20"
                  headers="product-availability"
                  key={product.entityId}
                >
                  {product.inventory.aggregated?.availableToSell || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              {products.map((product) => {
                if (product.productOptions.length) {
                  return (
                    <td className="border-b px-4 pb-24 pt-12" key={product.entityId}>
                      <Button aria-label={product.name} asChild className="hover:text-white">
                        <Link href={product.path}>{t('Table.viewOptions')}</Link>
                      </Button>
                    </td>
                  );
                }

                return (
                  <td className="border-b px-4 pb-24 pt-12" key={product.entityId}>
                    <AddToCart data={product} />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export const runtime = 'edge';
