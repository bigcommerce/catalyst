import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export const getStoreSettings = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  config: T = {} as T,
) => {
  const query = {
    site: {
      settings: {
        storeName: true,
        logoV2: {
          __typename: true,
          on_StoreTextLogo: {
            text: true,
          },
          on_StoreImageLogo: {
            image: {
              url: {
                __args: {
                  width: 155,
                },
              },
              altText: true,
            },
          },
        },
        contact: {
          address: true,
          email: true,
          phone: true,
        },
        socialMediaLinks: {
          name: true,
          url: true,
        },
        status: true,
      },
    },
  } satisfies QueryGenqlSelection;

  const queryOp = generateQueryOp(query);
  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });

  return response.data.site.settings;
};
