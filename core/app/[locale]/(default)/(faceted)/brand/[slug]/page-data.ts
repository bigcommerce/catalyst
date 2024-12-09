import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandQuery = graphql(`
  query BrandQuery($entityId: Int!) {
    site {
      brand(entityId: $entityId) {
        name
        defaultImage {
          urlOriginal
        }
        path
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof BrandQuery>;

export const getBrand = cache(async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: BrandQuery,
    variables,
    customerAccessToken,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.brand;
});

const ProductsQuery = graphql(`
  query ProductsQuery($entityIds: [Int!]) {
    site {
      products(entityIds: $entityIds) {
        edges {
          node {
            entityId
            name
            path
            defaultImage {
              url: urlTemplate(lossy: true)
              altText
            }
          }
        }
      }
    }
  }
`);

type ProductVariables = VariablesOf<typeof ProductsQuery>;

export const getCompareProducts = cache(async (variables: ProductVariables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: ProductsQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});
