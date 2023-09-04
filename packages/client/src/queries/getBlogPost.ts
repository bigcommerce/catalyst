import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export const getBlogPost = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  entityId: number,
  config: T = {} as T,
) => {
  const query = {
    site: {
      content: {
        blog: {
          isVisibleInNavigation: true,
          post: {
            __args: {
              entityId,
            },
            author: true,
            htmlBody: true,
            id: true,
            name: true,
            publishedDate: {
              utc: true,
            },
            tags: true,
            thumbnailImage: {
              altText: true,
              url: {
                __args: { width: 900 },
              },
            },
            seo: {
              metaKeywords: true,
              metaDescription: true,
              pageTitle: true,
            },
          },
        },
      },
      settings: {
        url: {
          vanityUrl: true,
        },
      },
    },
  } satisfies QueryGenqlSelection;

  const queryOp = generateQueryOp(query);

  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });

  const { blog } = response.data.site.content;

  if (!blog) {
    return undefined;
  }

  const { isVisibleInNavigation, post } = blog;

  return {
    ...post,
    isVisibleInNavigation,
    vanityUrl: response.data.site.settings?.url.vanityUrl,
  };
};
