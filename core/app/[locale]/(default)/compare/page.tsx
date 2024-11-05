import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import * as z from 'zod';

import { CompareSection } from '@/vibes/soul/sections/compare-section';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { addToCart } from './_actions/add-to-cart';
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
  // const t = await getTranslations('Compare');
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
    productOptions: removeEdgesAndNodes(product.productOptions),
  }));

  const formattedProducts = products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    description: product.description,
    rating: product.reviewSummary.averageRating,
  }));

  // if (!products.length) {
  //   return <CompareSection products={[]} />;
  // }

  return <CompareSection addToCartAction={addToCart} products={formattedProducts} />;
}

export const runtime = 'edge';
