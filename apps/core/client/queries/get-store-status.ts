import { client } from '..';
import { graphql } from '../generated';

export const GET_STORE_STATUS_QUERY = /* GraphQL */ `
  query getStoreStatus {
    site {
      settings {
        status
      }
    }
  }
`;

export const getStoreStatus = async () => {
  const query = graphql(GET_STORE_STATUS_QUERY);
  const { data } = await client.fetch({ document: query });

  return data.site.settings?.status;
};
