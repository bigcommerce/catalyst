import { client } from '..';
import { graphql } from '../graphql';

const GET_STORE_STATUS_QUERY = graphql(`
  query getStoreStatus {
    site {
      settings {
        status
      }
    }
  }
`);

export const getStoreStatus = async () => {
  const { data } = await client.fetch({
    document: GET_STORE_STATUS_QUERY,
    fetchOptions: { next: { revalidate: 300 } },
  });

  return data.site.settings?.status;
};
