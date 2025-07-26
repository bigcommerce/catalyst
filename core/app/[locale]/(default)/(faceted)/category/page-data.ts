import { cache } from 'react';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

// Brands query with pagination (accepts before)
export const CategoriesPageQuery = graphql(
  `
    query CategoriesPageQuery {
      site {
        categoryTree {
          name
          path
          image {
            urlOriginal
            url(width: 225, height: 200)
            altText
            isDefault
          }
          productCount
          children {
            name
            path
            children {
              name
              path
            }
          }
        }
      }
    }
  `,
  [],
);

// Fetch categories data with pagination (accepts before)
export const getCategoriesData = cache(async () => {
  const { data } = await client.fetch({
    document: CategoriesPageQuery,
    variables: {},
    fetchOptions: { next: { revalidate: 60 } }, // Adjust revalidate as needed
  });

  // Helper to remove edges/nodes structure
  const categories = data.site.categoryTree ?? [];
  return categories;
});
