'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const MoreProductImagesQuery = graphql(`
  query MoreProductImagesQuery($entityId: Int!, $first: Int!, $after: String!) {
    site {
      product(entityId: $entityId) {
        images(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              altText
              url: urlTemplate(lossy: true)
            }
          }
        }
      }
    }
  }
`);

export async function getMoreProductImages(
  productId: number,
  cursor: string,
  limit = 12,
): Promise<{
  images: Array<{ src: string; alt: string }>;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: MoreProductImagesQuery,
    variables: { entityId: productId, first: limit, after: cursor },
    customerAccessToken,
  });

  const images = removeEdgesAndNodes(data.site.product?.images ?? { edges: [] });

  return {
    images: images.map((img) => ({ src: img.url, alt: img.altText })),
    pageInfo: data.site.product?.images.pageInfo ?? { hasNextPage: false, endCursor: null },
  };
}
