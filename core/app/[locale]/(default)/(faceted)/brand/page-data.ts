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
    query BrandsPageQuery($after: String, $before: String, $first: Int) {
      site {
        brands(after: $after, before: $before, first: $first) {
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
    first = 20,
  }: { after?: string | null; before?: string | null; first?: number } = {}) => {
    // Only include 'after' or 'before', never both
    let variables: { after?: string | null; before?: string | null; first: number } = { first };
    if (after && !before) {
      variables.after = after;
    } else if (before && !after) {
      variables.before = before;
    }

    const { data } = await client.fetch({
      document: BrandsPageQuery,
      variables,
      fetchOptions: { next: { revalidate: 60 } }, // Adjust revalidate as needed
    });

    // Helper to remove edges/nodes structure
    const brands = data.site.brands.edges?.map((edge) => edge.node) ?? [];
    const pageInfo = data.site.brands.pageInfo;
    return { brands, pageInfo };
  },
);
