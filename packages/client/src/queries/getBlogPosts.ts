import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

interface BlogPostsFiltersInput {
  tagId?: string;
}

interface Pagination {
  limit?: number;
  before?: string;
  after?: string;
}

export const getBlogPosts = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { tagId, limit = 9, before, after }: BlogPostsFiltersInput & Pagination,
  config: T = {} as T,
) => {
  const filterArgs = tagId ? { tags: [tagId] } : {};
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const query = {
    site: {
      content: {
        blog: {
          id: true,
          isVisibleInNavigation: true,
          name: true,
          posts: {
            __args: {
              filters: {
                ...filterArgs,
              },
              ...paginationArgs,
            },
            pageInfo: {
              startCursor: true,
              endCursor: true,
              hasNextPage: true,
              hasPreviousPage: true,
            },
            edges: {
              node: {
                author: true,
                entityId: true,
                htmlBody: true,
                name: true,
                path: true,
                plainTextSummary: true,
                publishedDate: {
                  utc: true,
                },
                thumbnailImage: {
                  altText: true,
                  url: {
                    __args: { width: 300 },
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

  return {
    ...blog,
  };
};
