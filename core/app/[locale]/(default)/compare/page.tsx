import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import * as z from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
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

import { cookies, headers } from 'next/headers';

import { getPriceMaxRules } from '~/belami/lib/fetch-price-max-rules';

import { GetProductMetaFields } from '~/components/management-apis';
import { ReviewSummary } from '~/belami/components/reviews';
import Image from 'next/image';
import noImage from '~/public/no-image.svg';
import { CompareProductDetails } from './_components/compare-product-details';

interface MetaField {
  key: string;
  value: string;
  namespace: string;
}

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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Compare(props: Props) {
  const searchParams = await props.searchParams;
  const t = await getTranslations('Compare');
  const format = await getFormatter();
  const customerAccessToken = await getSessionCustomerAccessToken();

  const parsed = CompareParamsSchema.parse(searchParams);
  const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));

  const { data } = await client.fetch({
    document: ComparePageQuery,
    variables: {
      entityIds: productIds ?? [],
      first: productIds?.length ? MAX_COMPARE_LIMIT : 0,
    },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const products = removeEdgesAndNodes(data.site.products).map((product) => ({
    ...product,
    metafields: [],
    productOptions: removeEdgesAndNodes(product.productOptions),
  }));

  if (products && products.length > 0) {
    // Get MetaFields
    const metafieldsPromises = products.map(async (product: any) => {
      const productMetaFields = await GetProductMetaFields(product.entityId, '');
      return { [product.entityId]: productMetaFields };
    });

    const metafieldsArray = await Promise.all(metafieldsPromises);
    const metafields = metafieldsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    products.map((product: any) => {
      const productMetaFields = metafields[product.entityId] ?? null;
      product.metafields = productMetaFields;

      // Process Review Ratings
      const averageRatingMetaField = productMetaFields?.find(
        (field: MetaField) => field?.key === 'sv-average-rating',
      );
      const totalReviewsMetaField = productMetaFields?.find(
        (field: MetaField) => field?.key === 'sv-total-reviews',
      );

      if (averageRatingMetaField && totalReviewsMetaField) {
        product.reviewSummary.numberOfReviews = totalReviewsMetaField.value ?? 0;
        product.reviewSummary.averageRating = averageRatingMetaField.value ?? 0;
      }

      return product;
    });
  }
 
  if (!products.length) {
    return (
      <div className="w-full justify-center py-16 align-middle">
        <div className="pb-8">
          <h1 className="mb-4 text-2xl lg:mb-0 text-center">{t('nothingToCompare')}</h1>
          <p className="text-lg text-center">{t('helpingText')}</p>
        </div>
      </div>
    );
  }

  const cookieStore = await cookies();
  const priceMaxCookie = cookieStore.get('pmx');
  const priceMaxTriggers = priceMaxCookie?.value
    ? JSON.parse(atob(priceMaxCookie?.value))
    : undefined;

  const useDefaultPrices = !customerAccessToken;

  const priceMaxRules =
    priceMaxTriggers && Object.values(priceMaxTriggers).length > 0
      ? await getPriceMaxRules(priceMaxTriggers)
      : null;

  return (
    <div className="group pt-4 pb-10">
      <h1 className="mb-4 text-2xl lg:mb-0 text-center">
        {t('heading', { quantity: products.length })}
      </h1>

      <div className="mx-auto max-w-[93.5%] overflow-auto overscroll-x-contain">
        <table className="mx-auto w-full max-w-full table-fixed text-base md:w-fit">
          <caption className="sr-only">{t('Table.caption')}</caption>
          <colgroup>
            <col className="w-80" span={products.length + 1} />
          </colgroup>

          <thead>
            <tr>
              <th className="sr-only" key={0} scope="col">&nbsp;</th>
              {products.map((product) => (
                <th className="sr-only" key={product.entityId} scope="col">
                  {product.name}
                </th>
              ))}
            </tr>
            <tr>
              <td key={0}></td>
              {products.map((product) => (
                <td key={product.entityId}>
                  <div className="px-4">
                    <div className="pb-full relative mx-auto my-0 flex h-auto w-full overflow-hidden pb-[100%]">
                      <figure className="absolute left-0 top-0 h-full w-full">
                        <Link aria-label={product.name} href={product.path} className="flex h-full w-full items-center justify-center align-middle">
                        {product.defaultImage ? (
                          <BcImage
                            alt={product.defaultImage.altText}
                            height={300}
                            src={product.defaultImage.url}
                            width={300}
                            className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                          />
                        ) : (
                          <Image
                            src={noImage}
                            alt="No Image"
                            className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                          />
                        )}
                        </Link>
                      </figure>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td key={0}></td>
              {products.map((product) => (
                <td className="px-4 mt-2 text-center" key={product.entityId}>
                  {product.brand?.name}
                </td>
              ))}
            </tr>
            <tr>
              <td key={0}></td>
              {products.map((product) => (
                <td className="px-4 mt-2 text-center text-base font-medium" key={product.entityId}>
                  <Link href={product.path} className="!inline !text-center !leading-6 !tracking-normal">{product.name}</Link>
                </td>
              ))}
            </tr>
            <tr>
              <td key={0}></td>
              {products.map((product) => (
                <td className="px-4" key={product.entityId}>
                  {product.reviewSummary.numberOfReviews > 0 && (
                    <ReviewSummary
                      numberOfReviews={product.reviewSummary.numberOfReviews}
                      averageRating={product.reviewSummary.averageRating}
                      className="mx-auto mt-2 justify-center"
                    />
                  )}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareProductDetails products={products} priceMaxRules={priceMaxRules} useDefaultPrices={useDefaultPrices}/>
            <tr>
              <td key={0}></td>
              {products.map((product) => {
                if (product.productOptions.length) {
                  return (
                    <td className="px-4 pb-8 pt-8" key={product.entityId}>
                      <Button aria-label={product.name} asChild className="bg-brand-400 hover:text-white">
                        <Link href={product.path}>{t('Table.viewOptions')}</Link>
                      </Button>
                    </td>
                  );
                }

                return (
                  <td className="px-4 pb-8 pt-8" key={product.entityId}>
                    <AddToCart data={product} />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
{/*
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
*/}
    </div>
  );
}

//export const runtime = 'edge';
