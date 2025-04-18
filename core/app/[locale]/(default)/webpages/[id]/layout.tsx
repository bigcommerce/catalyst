import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { SidebarMenu } from '@/ui/sections/sidebar-menu';
import { StickySidebarLayout } from '@/ui/sections/sticky-sidebar-layout';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

interface Props extends React.PropsWithChildren {
  params: Promise<{ locale: string; id: string }>;
}

const WebPageChildrenQuery = graphql(`
  query WebPageChildrenQuery($id: ID!) {
    node(id: $id) {
      ... on WebPage {
        children(first: 20) {
          edges {
            node {
              name
              ... on NormalPage {
                path
              }
              ... on ContactPage {
                path
              }
              ... on RawHtmlPage {
                path
              }
              ... on ExternalLinkPage {
                link
              }
            }
          }
        }
      }
    }
  }
`);

interface PageLink {
  label: string;
  href: string;
}

const getWebPageChildren = cache(async (id: string): Promise<PageLink[]> => {
  const { data } = await client.fetch({
    document: WebPageChildrenQuery,
    variables: { id: decodeURIComponent(id) },
    fetchOptions: { next: { revalidate } },
  });

  if (!data.node) {
    return [];
  }

  if (!('children' in data.node)) {
    return [];
  }

  const { children } = data.node;

  return removeEdgesAndNodes(children).reduce((acc: PageLink[], child) => {
    if ('path' in child) {
      return [...acc, { label: child.name, href: child.path }];
    }

    if ('link' in child) {
      return [...acc, { label: child.name, href: child.link }];
    }

    return acc;
  }, []);
});

export default async function WebPageLayout({ params, children }: Props) {
  const { locale, id } = await params;

  setRequestLocale(locale);

  return (
    <StickySidebarLayout
      sidebar={<SidebarMenu links={getWebPageChildren(id)} />}
      sidebarSize="small"
    >
      {children}
    </StickySidebarLayout>
  );
}
