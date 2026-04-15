import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const BrandPageQuery = graphql(`
  query BrandPageQuery($entityId: Int!) {
    site {
      brand(entityId: $entityId) {
        name
        path
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
      settings {
        inventory {
          defaultOutOfStockMessage
          showOutOfStockMessage
          showBackorderMessage
        }
        storefront {
          catalog {
            productComparisonsEnabled
          }
        }
        display {
          showProductRating
        }
        reviews {
          enabled
        }
      }
    }
  }
`);

export const getBrandPageData = cache(async (entityId: number, customerAccessToken?: string) => {
  const response = await client.fetch({
    document: BrandPageQuery,
    variables: { entityId },
    customerAccessToken,
  });

  return response.data.site;
});
