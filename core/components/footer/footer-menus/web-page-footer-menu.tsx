import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { FragmentOf, graphql } from '~/client/graphql';

import { BaseFooterMenu } from '../footer-menus';

export const WebPageFooterMenuFragment = graphql(`
  fragment WebPageFooterMenuFragment on Content {
    pages(filters: { isVisibleInNavigation: true }) {
      edges {
        node {
          __typename
          name
          ... on RawHtmlPage {
            path
          }
          ... on ContactPage {
            path
          }
          ... on NormalPage {
            path
          }
          ... on BlogIndexPage {
            path
          }
          ... on ExternalLinkPage {
            link
          }
        }
      }
    }
  }
`);

interface Props {
  data: FragmentOf<typeof WebPageFooterMenuFragment>;
}

export const WebPageFooterMenu = ({ data }: Props) => {
  const pages = removeEdgesAndNodes(data.pages);

  const items = pages.map((page) => ({
    name: page.name,
    path: page.__typename === 'ExternalLinkPage' ? page.link : page.path,
  }));

  if (!items.length) {
    return null;
  }

  return <BaseFooterMenu items={items} title="Navigate" />;
};
