import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardCarousel } from '~/components/product-card-carousel';
import { ProductCardCarouselFragment } from '~/components/product-card-carousel/fragment';

const RelatedProductsQuery = graphql(
  `
    query RelatedProductsQuery($entityId: Int!) {
      site {
        product(entityId: $entityId) {
          relatedProducts(first: 12) {
            edges {
              node {
                ...ProductCardCarouselFragment
              }
            }
          }
        }
      }
    }
  `,
  [ProductCardCarouselFragment],
);

interface Props {
  productId: number;
}

export const RelatedProducts = async ({ productId }: Props) => {
  const t = await getTranslations('Product.Carousel');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: RelatedProductsQuery,
    variables: { entityId: productId },
    customerAccessToken,
    fetchOptions: { next: { revalidate: 3600 } },
  });

  const product = data.site.product;

  if (!product) {
    return null;
  }

  const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

  return (
    <ProductCardCarousel
      products={relatedProducts}
      showCart={false}
      showCompare={false}
      title={t('relatedProducts')}
    />
  );
};
