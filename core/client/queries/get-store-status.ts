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

export const getStoreStatus = async (channelId?: string) => {
  const { data } = await client.fetch({
    document: GET_STORE_STATUS_QUERY,
    fetchOptions: { next: { revalidate: 300 } },
    channelId,
  });

  return data.site.settings?.status;
};
