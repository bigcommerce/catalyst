'use server';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getSessionCustomerId } from '~/auth';

const ProductMetaFieldsQuery = graphql(
    `
    query ProductMetaFieldsQuery($entityId: Int!, $nameSpace: String!) {
        site {
            product(entityId: $entityId) {
                metafields(namespace: $nameSpace, first: 50) {
                    edges {
                        cursor
                        node {
                            entityId
                            id
                            key
                            value
                        }
                    }
                    pageInfo {
                        endCursor
                        hasNextPage
                        startCursor
                        hasPreviousPage
                    }
                }
            }
        }
    }`
);

export const getProductMetaFields = async (entityId: number, nameSpace: string) => {
    const customerId = await getSessionCustomerId();

    const { data } = await client.fetch({
        document: ProductMetaFieldsQuery,
        variables: {entityId: entityId, nameSpace: nameSpace}
    });
    return data;
};

const GetVariantsByProductSKUQuery = graphql(
  `query ProductsQuery {
    site {
      SKU1: product(sku: "73_Downrod") {
        sku
        entityId
        name
        mpn
        variants {
          edges {
            cursor
            node {
              entityId
              mpn
              sku
              id
              upc
            }
          }
        }
      }
      SKU2: product(sku: "372_CP5423L") {
        sku
        entityId
        name
        mpn
        variants {
          edges {
            cursor
            node {
              entityId
              mpn
              sku
              id
              upc
            }
          }
        }
      }
    }
  }`
);

export const GetVariantsByProductSKU = async () => {
  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
      document: GetVariantsByProductSKUQuery
  });
  return data;
};