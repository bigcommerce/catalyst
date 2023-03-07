import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MergeDeep } from 'type-fest';

import { serverClient } from '../../client/server';
import { Header, query as HeaderQuery, HeaderSiteQuery } from '../../components/Header';
import type { Page, StoreLogo } from '../../components/Header';
import {
  ProductTiles,
  ProductTilesConnection,
  query as ProductTilesQuery,
} from '../../components/ProductTiles';

interface Category {
  name: string;
  path: string;
  breadcrumbs: {
    edges: Array<{
      node: {
        entityId: number;
        name: string;
      };
    }>;
  };
  products: ProductTilesConnection;
}

export interface CategoryTree {
  name: string;
  path: string;
  children?: CategoryTree[];
}

interface CategoryQuery {
  site: MergeDeep<
    HeaderSiteQuery,
    {
      category: Category | null;
      settings: {
        storefront: {
          catalog: {
            productComparisonsEnabled: boolean;
          };
        };
      };
    }
  >;
}

interface CategoryPageProps {
  category: Category;
  categories: CategoryTree[];
  content: {
    pages: {
      edges: Array<{
        node: Page;
      }>;
    };
  };
  storeName: string;
  logo: StoreLogo;
  storefront: {
    catalog: {
      productComparisonsEnabled: boolean;
    };
  };
}

interface CategoryPageParams {
  [key: string]: string | string[] | undefined;
  cid: string;
}

export const getServerSideProps: GetServerSideProps<
  CategoryPageProps,
  CategoryPageParams
> = async ({ params }) => {
  if (!params?.cid) {
    return {
      notFound: true,
    };
  }

  const categoryId = parseInt(params.cid, 10);

  const { data } = await serverClient.query<CategoryQuery>({
    query: gql`
    query category($categoryId: Int!, $perPage: Int = 9) {
      site {
        category(entityId: $categoryId) {
          name
          path
          breadcrumbs(depth: 1) {
            edges {
              node {
                entityId
                name
              }
            }
          }
          products(first: $perPage) {
            ...${ProductTilesQuery.fragmentName}
          }
        }
        settings {
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }

        ...${HeaderQuery.fragmentName}
      }
    }

    ${HeaderQuery.fragment}
    ${ProductTilesQuery.fragment}
    `,
    variables: { categoryId },
  });

  if (data.site.category == null) {
    return { notFound: true };
  }

  return {
    props: {
      category: data.site.category,
      categories: data.site.categoryTree,
      content: data.site.content,
      storeName: data.site.settings.storeName,
      logo: data.site.settings.logoV2,
      storefront: data.site.settings.storefront,
    },
  };
};

// TODO: Re-type with similar method to HomePage
export default function CategoryPage({
  category,
  categories,
  content,
  storeName,
  storefront,
  logo,
}: CategoryPageProps) {
  return (
    <>
      <Head>
        <title>{category.name}</title>
      </Head>
      <Header categoryTree={categories} content={content} settings={{ logoV2: logo, storeName }} />
      <main>
        <div className="md:container md:mx-auto">
          <h1 className="font-black text-5xl leading-[4rem]">{category.name}</h1>
          <div className="grid grid-cols-4">
            <div className="col-span-1" />
            <div className="col-span-3">
              <ProductTiles
                cols={3}
                productComparisonsEnabled={storefront.catalog.productComparisonsEnabled}
                products={category.products}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
