import { cache } from 'react';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

// Fragment for brand fields
export const BrandFragment = graphql(
  `
    fragment BrandFragment on Brand {
      id
      name
      defaultImage {
        altText
        urlOriginal
      }
      path
      products {
        collectionInfo {
          totalItems
        }
      }
    }
  `,
  [],
);

// Brands query with pagination (accepts before)
export const BrandsPageQuery = graphql(
  `
    query BrandsPageQuery($first: Int, $last: Int, $after: String, $before: String) {
      site {
        brands(first: $first, after: $after, last: $last, before: $before) {
          edges {
            node {
              ...BrandFragment
            }
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
            hasPreviousPage
          }
        }
      }
    }
  `,
  [BrandFragment],
);

// Fetch brands data with pagination (accepts before)
export const getBrandsData = cache(
  async ({
    after = null,
    before = null,
    limit = 20,
  }: { after?: string | null; before?: string | null; limit?: number } = {}) => {
    // Only include 'after' or 'before', never both, and avoid 'first' with 'before'
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    console.log(`Fetching brands with pagination: ${JSON.stringify(paginationArgs)}`);

    const { data } = await client.fetch({
      document: BrandsPageQuery,
      variables: {
        ...paginationArgs,
      },
      fetchOptions: { next: { revalidate: 60 } }, // Adjust revalidate as needed
    });

    // Helper to remove edges/nodes structure
    const brands = data.site.brands.edges?.map((edge) => edge.node) ?? [];
    const pageInfo = data.site.brands.pageInfo;
    return { brands, pageInfo };
  },
);
