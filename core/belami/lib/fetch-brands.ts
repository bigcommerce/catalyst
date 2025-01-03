'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
//import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const BrandsPageQuery = function (cursor: string | null) {
  return graphql(`
    query Brands {
      site {
        brands (first: 50${cursor ? ', after: "' + cursor + '"' : ''}) {
          pageInfo {
            startCursor
            endCursor
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              entityId
              name
              defaultImage {
                urlOriginal
              }
              searchKeywords
              path
              metafields(namespace: "Search") {
                edges {
                  node {
                    id
                    entityId
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `);
};

export async function getBrands(customerAccessToken: string | undefined) {
  //const customerAccessToken = await getSessionCustomerAccessToken();

  let data = {
    site: {
      brands: {
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasNextPage: true,
        },
        edges: [],
      },
    },
  };

  while (data?.site?.brands?.pageInfo?.hasNextPage) {
    let res: any = await client.fetch({
      document: BrandsPageQuery(data?.site?.brands?.pageInfo?.endCursor),
      customerAccessToken,
      fetchOptions: { cache: 'force-cache' },
    });
    data.site.brands.pageInfo = res?.data?.site?.brands?.pageInfo;
    data.site.brands.edges = data.site.brands.edges.concat(res?.data?.site?.brands?.edges ?? []);
  }

  return removeEdgesAndNodes(data.site.brands).map((brand: any) => ({
    ...brand,
    metafields: removeEdgesAndNodes(brand?.metafields),
  }));
}
