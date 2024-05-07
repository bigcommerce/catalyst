import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import * as z from 'zod';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { Pricing, PricingFragment } from '~/components/pricing';
import { SearchForm } from '~/components/search-form';
import { Button } from '~/components/ui/button';
import { Rating } from '~/components/ui/rating';
import { LocaleType } from '~/i18n';
import { cn } from '~/lib/utils';

import { AddToCartForm } from './_components/add-to-cart-form';

const MAX_COMPARE_LIMIT = 10;

export const metadata = {
  title: 'Compare',
};

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
    query ComparePage($entityIds: [Int!], $first: Int) {
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
                url: urlTemplate
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
              availabilityV2 {
                status
              }
              ...PricingFragment
            }
          }
        }
      }
    }
  `,
  [PricingFragment],
);

export default async function Compare({
  params: { locale },
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { locale: LocaleType };
}) {
  const customerId = await getSessionCustomerId();
  const t = await getTranslations({ locale, namespace: 'Compare' });
  const messages = await getMessages({ locale });

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
          <h1 className="text-4xl font-black lg:text-5xl">{t('nothingCompare')}</h1>
          <p className="text-lg">{t('helpingText')}</p>
          <NextIntlClientProvider locale={locale} messages={{ NotFound: messages.NotFound ?? {} }}>
            <SearchForm />
          </NextIntlClientProvider>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="pb-8 text-4xl font-black lg:text-5xl">
        {t('comparingQuantity', { quantity: products.length })}
      </h1>

      <div className="-mx-6 overflow-auto overscroll-x-contain px-6 sm:-mx-10 sm:px-10 lg:-mx-12 lg:px-12">
        <table className="mx-auto w-full max-w-full table-fixed text-base md:w-fit">
          <caption className="sr-only">{t('productComparison')}</caption>

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
                        <p className="text-lg">{t('noImageText')}</p>
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
              {products.map((product) => (
                <td className="px-4 py-4 align-bottom text-base" key={product.entityId}>
                  {/* TODO: add translations */}
                  <Pricing data={product} />
                </td>
              ))}
            </tr>
            <tr>
              {products.map((product) => {
                if (product.productOptions.length) {
                  return (
                    <td className="border-b px-4 pb-12" key={product.entityId}>
                      <Button aria-label={product.name} asChild className="hover:text-white">
                        <Link href={product.path}>{t('chooseOptions')}</Link>
                      </Button>
                    </td>
                  );
                }

                return (
                  <td className="border-b px-4 pb-12" key={product.entityId}>
                    <NextIntlClientProvider
                      locale={locale}
                      messages={{ Compare: messages.Compare ?? {} }}
                    >
                      <AddToCartForm
                        availability={product.availabilityV2.status}
                        entityId={product.entityId}
                        productName={product.name}
                      />
                    </NextIntlClientProvider>
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="absolute mt-6">
              <th className="sticky start-0 top-0 m-0 ps-4 text-start" id="product-description">
                {t('description')}
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
                {t('rating')}
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
                      alt={
                        product.reviewSummary.numberOfReviews === 0
                          ? `${product.name} has no rating specified`
                          : `${product.name} rating is ${product.reviewSummary.averageRating} out of 5 stars`
                      }
                      value={product.reviewSummary.averageRating}
                    />
                  </p>
                </td>
              ))}
            </tr>
            <tr className="absolute mt-6">
              <th className="sticky start-0 top-0 m-0 ps-4 text-start" id="product-availability">
                {t('availability')}
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
                        <Link href={product.path}>{t('chooseOptions')}</Link>
                      </Button>
                    </td>
                  );
                }

                return (
                  <td className="border-b px-4 pb-24 pt-12" key={product.entityId}>
                    <NextIntlClientProvider
                      locale={locale}
                      messages={{ Compare: messages.Compare ?? {} }}
                    >
                      <AddToCartForm
                        availability={product.availabilityV2.status}
                        entityId={product.entityId}
                        productName={product.name}
                      />
                    </NextIntlClientProvider>
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
