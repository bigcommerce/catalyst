import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export const getWebPages = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  config: T = {} as T,
) => {
  const query = {
    site: {
      content: {
        pages: {
          edges: {
            node: {
              __typename: true,
              entityId: true,
              name: true,
              isVisibleInNavigation: true,
              parentEntityId: true,
              on_RawHtmlPage: {
                path: true,
              },
              on_ContactPage: {
                path: true,
              },
              on_NormalPage: {
                path: true,
              },
              on_BlogIndexPage: {
                path: true,
              },
              on_ExternalLinkPage: {
                link: true,
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

  const { pages } = response.data.site.content;

  if (!pages.edges?.length) {
    return [];
  }

  return removeEdgesAndNodes(pages);
};
