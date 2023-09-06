import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export interface GetWebPageOptions {
  path: string;
  characterLimit?: number;
}

export const getWebPage = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { path = '', characterLimit = 120 }: GetWebPageOptions,
  config: T = {} as T,
) => {
  const Page = {
    __typename: true,
    entityId: true,
    parentEntityId: true,
    name: true,
    path: true,
    isVisibleInNavigation: true,
    htmlBody: true,
    plainTextSummary: {
      __args: {
        characterLimit,
      },
    },
    seo: {
      pageTitle: true,
      metaKeywords: true,
      metaDescription: true,
    },
  };
  const RenderedRegions = {
    renderedRegions: {
      regions: {
        name: true,
        html: true,
      },
    },
  };

  const query = {
    site: {
      route: {
        __args: {
          path,
        },
        node: {
          on_RawHtmlPage: {
            ...Page,
          },
          on_ContactPage: {
            contactFields: true,
            ...Page,
            ...RenderedRegions,
          },
          on_NormalPage: {
            ...Page,
            ...RenderedRegions,
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

  const webpage = response.data.site.route.node;

  if (!webpage) {
    return undefined;
  }

  return {
    ...webpage,
  };
};
