import { DocumentNode } from '@apollo/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { MergeDeep } from 'type-fest';

import { getServerClient } from '@client/server';
import { gql } from '@client/utils';
import { Pagination } from '@reactant/components/Pagination';
import { ChevronLeftIcon } from '@reactant/icons/ChevronLeft';
import { ChevronRightIcon } from '@reactant/icons/ChevronRight';

import { Facets, FacetsState, Filters } from '../../components/Facets';
import { Footer, query as FooterQuery, FooterSiteQuery } from '../../components/Footer';
import { Header, query as HeaderQuery, HeaderSiteQuery } from '../../components/Header';
import { ProductTiles, ProductTilesConnection } from '../../components/ProductTiles';
import { queryBack as SearchBackQuery, queryForward as SearchForwardQuery } from '../../fragments';

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
    MergeDeep<HeaderSiteQuery, FooterSiteQuery>,
    {
      category: Category | null;
      settings: {
        storefront: {
          catalog: {
            productComparisonsEnabled: boolean;
          };
        };
      };
      search: Search;
      pageFacets: FacetsState;
    }
  >;
}

interface URLSearchParams {
  before?: string;
  after?: string;
  brandIds?: string;
  isFreeShipping?: string;
  isFeatured?: string;
  isInStock?: string;
}

interface CategoryPageProps {
  brands: FooterSiteQuery['brands'];
  category: Category;
  categories: CategoryTree[];
  storefront: {
    catalog: {
      productComparisonsEnabled: boolean;
    };
  };
  settings: FooterSiteQuery['settings'];
  search: Search;
  pageFacets: FacetsState;
}

interface Search {
  searchProducts: {
    products: ProductTilesConnection;
    filters: Filters;
  };
}

interface CategoryPageParams {
  [key: string]: string | string[] | undefined;
  cid: string;
}

const getParams = (
  urlQuery: URLSearchParams,
): [Record<keyof FacetsState, number[] | boolean | null>, FacetsState] => {
  const { brandIds, isInStock, isFreeShipping, isFeatured } = urlQuery;

  return [
    {
      brandIds: brandIds ? brandIds.split(',').map(Number) : [],
      isInStock: isInStock ? Boolean(isInStock) : null,
      isFreeShipping: isFreeShipping ? Boolean(isFreeShipping) : null,
      isFeatured: isFeatured ? Boolean(isFeatured) : null,
    },
    {
      brandIds: brandIds ?? null,
      isInStock: isInStock ? parseInt(isInStock, 10) : false,
      isFreeShipping: isFreeShipping ? parseInt(isFreeShipping, 10) : false,
      isFeatured: isFeatured ? parseInt(isFeatured, 10) : false,
    },
  ];
};

const createPageQuery = (
  urlQuery: URLSearchParams,
): { cursor: string; pageQuery: DocumentNode } => {
  let cursor: string;
  let pageQuery: DocumentNode;

  if (urlQuery.after) {
    cursor = urlQuery.after;
    pageQuery = gql`
    query categoryWithFacets($brandIds: [Int!], $categoryId: Int!, $isFreeShipping: Boolean, $isFeatured: Boolean, $hideOutOfStock: Boolean, $cursor: String, $perPage: Int = 9){
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
        }
        settings {
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }
  
        ...${SearchForwardQuery.fragmentName}
  
        ...${HeaderQuery.fragmentName}
      }
    }
  
    ${SearchForwardQuery.fragment}
    ${HeaderQuery.fragment}
    `;
  } else if (urlQuery.before) {
    cursor = urlQuery.before;
    pageQuery = gql`
    query categoryWithFacets($brandIds: [Int!], $categoryId: Int!, $isFreeShipping: Boolean, $isFeatured: Boolean, $hideOutOfStock: Boolean, $cursor: String, $perPage: Int = 9){
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
        }
        settings {
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }
  
        ...${SearchBackQuery.fragmentName}
  
        ...${HeaderQuery.fragmentName}
      }
    }
  
    ${SearchBackQuery.fragment}
    ${HeaderQuery.fragment}
    `;
  } else {
    cursor = '';
    pageQuery = gql`
    query categoryWithFacets($brandIds: [Int!], $categoryId: Int!, $isFreeShipping: Boolean, $isFeatured: Boolean, $hideOutOfStock: Boolean, $cursor: String, $perPage: Int = 9){
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
        }
        settings {
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }
  
        ...${SearchForwardQuery.fragmentName}
  
        ...${HeaderQuery.fragmentName}
        ...${FooterQuery.fragmentName}
      }
    }
  
    ${SearchForwardQuery.fragment}
    ${HeaderQuery.fragment}
    ${FooterQuery.fragment}
    `;
  }

  return { cursor, pageQuery };
};

export const getServerSideProps: GetServerSideProps<
  CategoryPageProps,
  CategoryPageParams,
  URLSearchParams
> = async ({ params, query }) => {
  if (!params?.cid) {
    return {
      notFound: true,
    };
  }

  const [{ brandIds, isInStock: hideOutOfStock, isFeatured, isFreeShipping }, pageFacets] =
    getParams(query);
  const { cursor, pageQuery } = createPageQuery(query);

  const client = getServerClient();
  const categoryId = parseInt(params.cid, 10);

  const { data } = await client.query<CategoryQuery>({
    query: pageQuery,
    variables: {
      categoryId,
      cursor,
      brandIds,
      hideOutOfStock,
      isFeatured,
      isFreeShipping,
    },
  });

  if (data.site.category == null) {
    return { notFound: true };
  }

  return {
    props: {
      brands: data.site.brands,
      category: data.site.category,
      categories: data.site.categoryTree,
      settings: data.site.settings,
      storefront: data.site.settings.storefront,
      search: data.site.search,
      pageFacets,
    },
  };
};

// TODO: Re-type with similar method to HomePage
export default function CategoryPage({
  brands,
  category,
  categories,
  storefront,
  settings,
  search,
  pageFacets,
}: CategoryPageProps) {
  return (
    <>
      <Head>
        <title>{category.name}</title>
      </Head>
      <Header
        categoryTree={categories}
        settings={{ logoV2: settings.logoV2, storeName: settings.storeName }}
      />
      <main>
        <div className="md:container md:mx-auto">
          <h1 className="font-black text-5xl leading-[4rem] mb-8">{category.name}</h1>
          <div className="grid grid-cols-4">
            <div className="col-span-1 mr-8">
              <Facets
                filters={search.searchProducts.filters}
                pageFacets={pageFacets}
                pagePath={category.path}
              />
            </div>
            <div className="col-span-3">
              <ProductTiles
                cols={3}
                productComparisonsEnabled={storefront.catalog.productComparisonsEnabled}
                products={search.searchProducts.products}
              />
              {(search.searchProducts.products.pageInfo.hasNextPage ||
                search.searchProducts.products.pageInfo.hasPreviousPage) && (
                <Pagination className={Pagination.default.className}>
                  <Link
                    href={`${category.path}?first=9&before=${search.searchProducts.products.pageInfo.startCursor}`}
                  >
                    <ChevronLeftIcon className={Pagination.PrevPage.default.className} />
                  </Link>
                  <Link
                    href={`${category.path}?page=9&after=${search.searchProducts.products.pageInfo.endCursor}`}
                  >
                    <ChevronRightIcon className={Pagination.NextPage.default.className} />
                  </Link>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer brands={brands} categoryTree={categories} settings={settings} />
    </>
  );
}
