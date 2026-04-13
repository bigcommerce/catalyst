import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cacheLife } from 'next/cache';
import { cache, Suspense } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { SidebarMenu } from '@/vibes/soul/sections/sidebar-menu';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';
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

async function getCachedWebPageChildren(locale: string, id: string): Promise<PageLink[]> {
  'use cache';

  cacheLife({ revalidate });

  const { data } = await client.fetch({
    document: WebPageChildrenQuery,
    variables: { id: decodeURIComponent(id) },
    locale,
    fetchOptions: { cache: 'no-store' },
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
}

const getWebPageChildren = cache(async (locale: string, id: string): Promise<PageLink[]> => {
  return getCachedWebPageChildren(locale, id);
});

async function WebPageLayoutContent({ params, children }: Props) {
  const { locale, id } = await params;

  return (
    <StickySidebarLayout
      sidebar={<SidebarMenu links={Streamable.from(() => getWebPageChildren(locale, id))} />}
      sidebarSize="small"
    >
      {children}
    </StickySidebarLayout>
  );
}

export default function WebPageLayout(props: Props) {
  return (
    <Suspense>
      <WebPageLayoutContent {...props} />
    </Suspense>
  );
}
