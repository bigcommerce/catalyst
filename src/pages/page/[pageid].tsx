import { gql } from '@apollo/client';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { MergeDeep } from 'type-fest';

import { serverClient } from '../../client/server';
import { Header, query as HeaderQuery, HeaderSiteQuery } from '../../components/Header';
import type { Page, StoreLogo } from '../../components/Header';
import { CategoryTree } from '../category/[cid]';

interface Region {
  name: string;
  html: string;
}

interface PageQuery {
  site: MergeDeep<
    HeaderSiteQuery,
    {
      content: {
        renderedRegionsByPageTypeAndEntityId: {
          regions: Region[];
        };
      };
    }
  >;
}

interface PageProps {
  content: {
    regions: Region[];
    pages: {
      edges: Array<{
        node: Page;
      }>;
    };
  };
  page: Page;
  categories: CategoryTree[];
  storeName: string;
  logo: StoreLogo;
}

interface PageParams {
  [key: string]: string | string[];
  pageid: string;
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<PageProps, PageParams> = async ({ params }) => {
  if (!params?.pageid) {
    return {
      notFound: true,
    };
  }

  const pageId = parseInt(params.pageid, 10);

  const { data } = await serverClient.query<PageQuery>({
    query: gql`
    query regionsByPage($pageId: Long!) {
      site {
        content {
          renderedRegionsByPageTypeAndEntityId(entityPageType: PAGE, entityId: $pageId) {
            regions {
              name
              html
            }
          }
        }
        ...${HeaderQuery.fragmentName}
      }
    }

    ${HeaderQuery.fragment}
    `,
    variables: { pageId },
  });

  return {
    props: {
      content: {
        regions: data.site.content.renderedRegionsByPageTypeAndEntityId.regions.filter(
          (region) => region.name === 'page_builder_content',
        ),
        pages: data.site.content.pages,
      },
      page: data.site.content.pages.edges.filter(({ node }) => node.entityId === pageId)[0].node,
      categories: data.site.categoryTree,
      storeName: data.site.settings.storeName,
      logo: data.site.settings.logoV2,
    },
  };
};

export default function Page({ content, page, categories, logo, storeName }: PageProps) {
  return (
    <>
      <Head>
        <title>{page.name}</title>
      </Head>
      <Header categoryTree={categories} content={content} settings={{ logoV2: logo, storeName }} />
      <main>
        <div className="md:container md:mx-auto">
          <h1 className="font-black text-5xl leading-[4rem]">{page.name}</h1>
          <div className="my-12 mx-6 sm:mx-10 md:mx-auto">
            {content.regions.map(({ name, html }) => (
              <div
                dangerouslySetInnerHTML={{ __html: html }}
                data-content-region={name}
                key={name}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
