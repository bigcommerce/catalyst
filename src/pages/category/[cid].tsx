import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';

import { Swatch, SwatchGroup } from '../../../reactant/components/Swatch';
import { http } from '../../client';
import { Header } from '../../components/Header';
import type { StoreLogo } from '../../components/Header';

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
  products: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        path: string;
        defaultImage: {
          url: string;
          altText: string;
        } | null;
        brand: {
          name: string;
        } | null;
        prices: {
          price: {
            formatted: string;
          } | null;
        };
        productOptions: {
          edges: Array<{
            node: {
              entityId: number;
              displayName: string;
              isRequired: boolean;
              __typename: string;
              displayStyle: string;
              values: {
                edges: Array<{
                  node: {
                    entityId: number;
                    label: string;
                    isDefault: boolean;
                    hexColors: string[];
                    imageUrl: string | null;
                    isSelected: boolean;
                  };
                }>;
              };
            };
          }>;
        };
      };
    }>;
  };
}

interface CategoryTree {
  name: string;
  path: string;
  children?: CategoryTree[];
}

interface CategoryPageProps {
  category: Category;
  categories: CategoryTree[];
  storeName: string;
  logo: StoreLogo;
}

interface CategoryQuery {
  data: {
    site: {
      category: Category | null;
      categoryTree: CategoryTree[];
      settings: {
        storeName: string;
        logoV2: StoreLogo;
      };
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

  const { data } = await http.query<CategoryQuery>(
    `
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
            edges {
              node {
                id
                path
                name
                defaultImage {
                  url: url(width: 300)
                  altText
                }
                brand {
                  name
                }
                prices {
                  price {
                    formatted
                  }
                }
                productOptions(first: 3) {
                  edges {
                    node {
                      entityId
                      displayName
                      isRequired
                      __typename
                      ... on MultipleChoiceOption {
                        displayStyle
                        values(first: 5) {
                          edges {
                            node {
                              entityId
                                
                              isDefault
                              ... on SwatchOptionValue {
                                hexColors
                                imageUrl(width: 200)
                                isSelected
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        categoryTree {
          ...Category
          children {
            ...Category
            children {
              ...Category
            }
          }
        }
        settings {
          storeName
          logoV2 {
            __typename
            ... on StoreTextLogo{
              text
            }
            ... on StoreImageLogo{
              image {
                url(width: 155)
                altText
              }
            }
          }
        }
      }
    }

    fragment Category on CategoryTreeItem {
      name
      path
    }
  `,
    { categoryId },
  );

  if (data.site.category == null) {
    return { notFound: true };
  }

  return {
    props: {
      category: data.site.category,
      categories: data.site.categoryTree,
      storeName: data.site.settings.storeName,
      logo: data.site.settings.logoV2,
    },
  };
};

export default function CategoryPage({ category, categories, storeName, logo }: CategoryPageProps) {
  return (
    <>
      <Head>
        <title>{category.name}</title>
      </Head>
      <Header categories={categories} logo={logo} storeName={storeName} />
      <main>
        <div className="md:container md:mx-auto">
          <h1 className="font-black text-5xl leading-[4rem]">{category.name}</h1>
          <div className="grid grid-cols-4">
            <div className="col-span-1" />
            <div className="col-span-3">
              <ul className="grid grid-cols-2 md:grid-cols-3 grid-flow-cols gap-8">
                {category.products.edges.map(({ node }) => (
                  <li className="basis-1/3" key={node.id}>
                    <a href={node.path}>
                      {node.defaultImage?.url ? (
                        <Image
                          alt={node.defaultImage.altText || node.name}
                          className="aspect-[7/5] object-cover mb-5"
                          height={208}
                          src={node.defaultImage.url}
                          width={292}
                        />
                      ) : null}
                      {node.productOptions.edges.map(({ node: options }) => {
                        if (
                          options.__typename === 'MultipleChoiceOption' &&
                          options.displayStyle === 'Swatch'
                        ) {
                          return (
                            <SwatchGroup
                              className={SwatchGroup.default.className}
                              key={options.entityId}
                              role="radiogroup"
                            >
                              {options.values.edges.map(({ node: variant }) => (
                                <Swatch className={Swatch.default.className} key={variant.entityId}>
                                  <Swatch.Label
                                    className={Swatch.Label.default.className}
                                    title={variant.label}
                                  >
                                    <Swatch.Variant
                                      className={Swatch.Variant.default.className}
                                      variantColor={variant.hexColors[0]}
                                    />
                                  </Swatch.Label>
                                  <Swatch.Input
                                    aria-label={variant.label}
                                    className={Swatch.Input.default.className}
                                    name={`${variant.entityId}`}
                                    type="radio"
                                    value={variant.entityId}
                                  />
                                </Swatch>
                              ))}
                            </SwatchGroup>
                          );
                        }

                        return false;
                      })}
                      {node.brand?.name ? (
                        <p className="text-[#546E7A] text-base">{node.brand.name}</p>
                      ) : null}
                      <h4 className="text-xl font-bold mb-3">{node.name}</h4>
                      <p className="text-base">{node.prices.price?.formatted}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
