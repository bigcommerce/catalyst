'use server';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getSessionCustomerAccessToken } from '~/auth';
import { revalidate } from '~/client/revalidate-target';

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
  const { data } = await client.fetch({
    document: ProductMetaFieldsQuery,
    variables: {entityId: entityId, nameSpace: nameSpace}
  });
  return data;
};

const splitArray = (array: Array<any>, count: number) => {
  let result = [],
  i = 0;
  while (i < array.length) {
    result.push(array?.slice(i, i += count));
  }
  return result;
}

export const GetVariantsByProductSKU = async (skuArray: any) => {
  let productVariantData: Array<any> = [];
  if(skuArray?.length > 0) {
    let splitSkuArray = splitArray(skuArray, 20);
    if(splitSkuArray?.length > 0) {
      for await (const skuArrayData of splitSkuArray) {
        let skuQuery = '';
        skuQuery += `query ProductsQuery {
          site {`;
        let index: number = 1;
        for await (const sku of skuArrayData) {
          skuQuery += `SKU${index}: product(sku: "${sku}") {
            sku
            entityId
            name
            mpn
            images {
              edges {
                node {
                  altText
                  url(width: 350)
                  isDefault
                }
              }
            }
            prices {
              retailPrice {
                value
                formatted
              }
              salePrice {
                formatted
                value
              }
              price {
                formatted
                value
              }
            }
            upc
          }`;
          index++;
        }
        skuQuery += `}
        }`;
        const customerAccessToken = await getSessionCustomerAccessToken();
        const { data } = await client.fetch({
          document: graphql(skuQuery),
          customerAccessToken,
          fetchOptions: { next: { revalidate } },
        });
        Object.values(data?.site)?.forEach((element: any) => {
          if(element?.sku) {
            productVariantData.push({...element});
          }
        });
      }
    }
  }
  return productVariantData;
}