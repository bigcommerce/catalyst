import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';

export const GET_WEB_PAGE_QUERY = /* GraphQL */ `
  query getWebPage($path: String!, $characterLimit: Int = 120) {
    site {
      route(path: $path) {
        node {
          ... on RawHtmlPage {
            path
            htmlBody
            plainTextSummary(characterLimit: $characterLimit)
            seo {
              pageTitle
              metaKeywords
              metaDescription
            }
            ...WebPage
          }
          ... on ContactPage {
            contactFields
            path
            htmlBody
            plainTextSummary(characterLimit: $characterLimit)
            renderedRegions {
              regions {
                name
                html
              }
            }
            seo {
              pageTitle
              metaKeywords
              metaDescription
            }
            ...WebPage
          }
          ... on NormalPage {
            htmlBody
            plainTextSummary(characterLimit: $characterLimit)
            renderedRegions {
              regions {
                name
                html
              }
            }
            seo {
              pageTitle
              metaKeywords
              metaDescription
            }
            ...WebPage
          }
        }
      }
    }
  }
`;

export interface Options {
  path: string;
  characterLimit?: number;
}

export const getWebPage = cache(async ({ path, characterLimit = 120 }: Options) => {
  const query = graphql(GET_WEB_PAGE_QUERY);

  const response = await client.fetch({
    document: query,
    variables: { path, characterLimit },
  });

  const webpage = response.data.site.route.node;

  if (!webpage) {
    return undefined;
  }

  switch (webpage.__typename) {
    case 'ContactPage':
    case 'NormalPage':
    case 'RawHtmlPage':
      return webpage;

    default:
      return undefined;
  }
});
