import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarousel } from '~/components/featured-products-carousel';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';

const RelatedProductsQuery = graphql(
  `
    query RelatedProductsQuery($entityId: Int!) {
      site {
        product(entityId: $entityId) {
          relatedProducts(first: 12) {
            edges {
              node {
                ...FeaturedProductsCarouselFragment
              }
            }
          }
        }
      }
    }
  `,
  [FeaturedProductsCarouselFragment],
);

interface Props {
  productId: number;
}

export const RelatedProducts = async ({ productId }: Props) => {
  const t = await getTranslations('Product.Carousel');

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: RelatedProductsQuery,
    variables: { entityId: productId },
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const product = data.site.product;

  if (!product) {
    return null;
  }

  const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

  return (
    <FeaturedProductsCarousel
      cta={{ label: t('seeAll'), href: '#' }} // TODO: remove?
      products={relatedProducts}
      title={t('relatedProducts')}
    />
  );
};
