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
    console.log('========entityId=======', entityId);
    const customerId = await getSessionCustomerId();

    const { data } = await client.fetch({
        document: ProductMetaFieldsQuery,
        variables: {entityId: entityId, nameSpace: nameSpace}
    });
    console.log('========datasssss=======', data);
};