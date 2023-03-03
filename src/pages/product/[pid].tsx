import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import React, { useState } from 'react';
import { MergeDeep } from 'type-fest';

import { Breadcrumbs } from '../../../reactant/components/Breadcrumbs';
import { Button } from '../../../reactant/components/Button';
import { Link } from '../../../reactant/components/Link';
import { Rating } from '../../../reactant/components/Rating';
import { Label, Swatch, SwatchGroup } from '../../../reactant/components/Swatch';
import { CartIcon } from '../../../reactant/icons/Cart';
import { DividerIcon } from '../../../reactant/icons/Divider';
import { HeartIcon } from '../../../reactant/icons/Heart';
import { Footer, FooterSiteQuery } from '../../components/Footer';
import { Header, HeaderSiteQuery } from '../../components/Header';
import { getServerClient } from '../../graphql/server';
import { gql } from '../../graphql/utils';
import { CategoryTree } from '../category/[cid]';

interface Product {
  variants: {
    edges: Array<{
      node: {
        sku: string;
        upc: string | null;
        defaultImage: {
          url: string | null;
          altText: string;
        };
        prices: {
          price: {
            value: number;
            currencyCode: string;
            formatted: string;
          };
        };
        options: {
          edges: Array<{
            node: {
              displayName: string;
              values: {
                edges: Array<{
                  node: {
                    entityId: number;
                    label: string;
                  };
                }>;
              };
            };
          }>;
        };
      };
    }>;
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
  sku: string;
  warranty: string;
  name: string;
  plainTextDescription: string;
  minPurchaseQuantity: string | null;
  maxPurchaseQuantity: string | null;
  upc: string | null;
  condition: string;
  availabilityV2: {
    status: string;
    description: string;
  };
  defaultImage: {
    url: string;
    altText: string;
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
  prices: {
    price: {
      formatted: string;
    };
    priceRange: {
      min: {
        formatted: string;
      };
      max: {
        formatted: string;
      };
    };
  };
  brand: {
    name: string;
  } | null;
  reviews: {
    edges: Array<{
      node: {
        author: {
          name: string;
        };
        entityId: number;
        title: string;
        text: string;
        rating: number;
        createdAt: {
          utc: string;
        };
      };
    }>;
  };
  reviewSummary: {
    summationOfRatings: number;
    numberOfReviews: number;
  };
}

interface ProductQuery {
  site: MergeDeep<
    MergeDeep<HeaderSiteQuery, FooterSiteQuery>,
    {
      categoryTree: CategoryTree[];
      product: Product | null;
    }
  >;
}

interface ProductPageProps {
  brands: FooterSiteQuery['brands'];
  categoryTree: CategoryTree[];
  product: Product;
  settings: FooterSiteQuery['settings'];
}

interface ProductPageParams {
  [key: string]: string | string[];
  pid: string;
}

export const getServerSideProps: GetServerSideProps<ProductPageProps, ProductPageParams> = async ({
  params,
}) => {
  if (!params?.pid) {
    return {
      notFound: true,
    };
  }

  const client = getServerClient();
  const productId = parseInt(params.pid, 10);

  const { data } = await client.query<ProductQuery>({
    query: gql`
      query productById($productId: Int!) {
        site {
          product(entityId: $productId) {
            categories(first: 10) {
              edges {
                node {
                  breadcrumbs(depth: 10) {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                }
              }
            }
            variants(first: 5) {
              edges {
                node {
                  sku
                  upc
                  defaultImage {
                    url(width: 1000)
                    altText
                  }
                  prices {
                    price {
                      ...MoneyFields
                    }
                  }
                  options(first: 5) {
                    edges {
                      node {
                        displayName
                        values(first: 5) {
                          edges {
                            node {
                              entityId
                              label
                            }
                          }
                        }
                      }
                    }
                  }
                }
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
                            label
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            sku
            warranty
            name
            plainTextDescription
            minPurchaseQuantity
            maxPurchaseQuantity
            upc
            condition
            availabilityV2 {
              status
              description
            }
            defaultImage {
              ...ImageFields
            }
            images {
              edges {
                node {
                  ...ImageFields
                }
              }
            }
            prices {
              price {
                ...MoneyFields
              }
              priceRange {
                min {
                  ...MoneyFields
                }
                max {
                  ...MoneyFields
                }
              }
            }
            brand {
              name
            }
            reviews(first: 5) {
              edges {
                node {
                  author {
                    name
                  }
                  entityId
                  title
                  text
                  rating
                  createdAt {
                    utc
                  }
                }
              }
            }
            reviewSummary {
              summationOfRatings
              numberOfReviews
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
              ... on StoreTextLogo {
                text
              }
              ... on StoreImageLogo {
                image {
                  url(width: 155)
                  altText
                }
              }
            }
            contact {
              address
              phone
            }
            socialMediaLinks {
              name
              url
            }
          }
          brands {
            edges {
              node {
                name
                path
              }
            }
          }
        }
      }

      fragment ImageFields on Image {
        url: url(width: 320)
        altText
      }

      fragment MoneyFields on Money {
        value
        currencyCode
        formatted
      }

      fragment Category on CategoryTreeItem {
        name
        path
      }
    `,
    variables: {
      productId,
    },
  });

  if (data.site.product == null) {
    return { notFound: true };
  }

  return {
    props: {
      brands: data.site.brands,
      categoryTree: data.site.categoryTree,
      product: data.site.product,
      settings: data.site.settings,
    },
  };
};

export default function ProductPage({
  brands,
  categoryTree,
  product,
  settings,
}: ProductPageProps) {
  const breadcrumbs = [
    { name: 'Home Page', path: '/' },
    { name: 'Caterory Page', path: '/category' },
    { name: 'Product Details Page', path: '/product-details' },
  ];

  const swatchOptions = product.productOptions.edges.filter(
    (option) => option.node.displayStyle === 'Swatch',
  );
  const defaultSwatchOption = swatchOptions[0].node.values.edges.filter(
    (value) => value.node.isDefault,
  );
  const defaultSwatchId = defaultSwatchOption.length ? defaultSwatchOption[0].node.entityId : null;
  const [optionId, setOptionId] = useState(defaultSwatchId);

  const getVariant = (id: number | null) => {
    const variant = product.variants.edges.filter(
      (variantItem) => variantItem.node.options.edges[0].node.values.edges[0].node.entityId === id,
    );

    if (!variant.length) {
      return [];
    }

    return variant;
  };

  const variantAltText = getVariant(optionId).length
    ? getVariant(optionId)[0].node.defaultImage.altText
    : null;
  const variantImage = getVariant(optionId).length
    ? getVariant(optionId)[0].node.defaultImage.url
    : null;
  const variantPrice = getVariant(optionId).length
    ? getVariant(optionId)[0].node.prices.price.formatted
    : null;
  const variantSku = getVariant(optionId).length ? getVariant(optionId)[0].node.sku : null;
  const variantUpc = getVariant(optionId).length ? getVariant(optionId)[0].node.upc : null;

  const onSwatchClick = (id: number) => {
    setOptionId(id);
    getVariant(id);
  };

  return (
    <>
      <Head>
        <title>{product.name}</title>
      </Head>
      <Header categoryTree={categoryTree} settings={settings} />
      <main>
        <div className="md:container md:mx-auto mb-14">
          <div className="mb-4">
            <Breadcrumbs className={Breadcrumbs.default.className}>
              {breadcrumbs.map((item, index, arr) => {
                return (
                  <Breadcrumbs.Item className={Breadcrumbs.Item.default.className} key={item.name}>
                    {arr.length - 1 === index ? (
                      <Breadcrumbs.Path className={Breadcrumbs.Path.lastItem.className}>
                        {item.name}
                      </Breadcrumbs.Path>
                    ) : (
                      <>
                        <Breadcrumbs.Path
                          className={Breadcrumbs.Path.default.className}
                          href={item.path}
                        >
                          {item.name}
                        </Breadcrumbs.Path>
                        <Breadcrumbs.Divider className={Breadcrumbs.Divider.default.className}>
                          <DividerIcon />
                        </Breadcrumbs.Divider>
                      </>
                    )}
                  </Breadcrumbs.Item>
                );
              })}
            </Breadcrumbs>
          </div>

          <div className="grid gap-x-8 grid-cols-2">
            <div className="col-span-1">
              <div className="flex flex-col mb-12">
                <Image
                  alt={variantAltText || product.defaultImage.altText}
                  height={619}
                  priority
                  src={variantImage || product.defaultImage.url}
                  width={619}
                />

                <ul className="grid grid-cols-5 mt-6">
                  {product.images.edges.map(({ node }, index) => {
                    return (
                      <li className="col-span-1 flex justify-center" key={index}>
                        <Image
                          alt={node.altText}
                          height={104}
                          priority
                          src={node.url}
                          width={104}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-black">Description</h2>
                <p className="text-base font-normal leading-7 text-black">
                  {product.plainTextDescription}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-black">Warranty</h2>
                <p className="text-base font-normal leading-7 text-black">{product.warranty}</p>
              </div>

              <div className="reviews">
                {product.reviews.edges.map((review, i) => {
                  return (
                    <React.Fragment key={review.node.entityId}>
                      <h2 className="mb-[26px] text-xl font-bold text-black">Rewiev {i + 1}</h2>
                      <div className="mb-3.5">
                        <Rating value={review.node.rating} />
                      </div>
                      <p className="font-semibold text-base text-black">{review.node.title}</p>
                      <p className="mb-4 font-normal text-base text-[#546E7A]">
                        Posted by{' '}
                        {review.node.author.name !== '' ? review.node.author.name : 'Customer'} on{' '}
                        {review.node.createdAt.utc}
                      </p>
                      <p className="text-base font-normal leading-7 text-black mb-6">
                        {review.node.text}
                      </p>
                    </React.Fragment>
                  );
                })}
                <Button className={Button.secondary.className}>Write review</Button>
              </div>
            </div>

            <div className="col-span-1">
              {product.brand ? (
                <p className="font-semibold text-base text-[#546E7A] uppercase leading-[27px]">
                  {product.brand.name}
                </p>
              ) : null}
              <h1 className="text-[50px] font-black leading-[66px] text-black mb-3">
                {product.name}
              </h1>
              <div className="flex items-center mb-6">
                <span className="mr-3.5">
                  <Rating
                    value={
                      product.reviewSummary.summationOfRatings /
                      product.reviewSummary.numberOfReviews
                    }
                  />
                </span>
                <span className="mr-3 !font-semibold">
                  {product.reviewSummary.summationOfRatings} (
                  {product.reviewSummary.numberOfReviews})
                </span>
                <Link className={`${Link.text.className} text-[#053FB0] !font-semibold`} href="#">
                  Write review
                </Link>
              </div>

              <p className="mb-6 font-bold text-[28px]">
                {variantPrice ||
                  `${product.prices.priceRange.min.formatted}-${product.prices.priceRange.max.formatted}` ||
                  product.prices.price.formatted}
              </p>

              <form action="#">
                <div className="mb-6">
                  {product.productOptions.edges
                    .filter((option) => option.node.displayStyle === 'Swatch')
                    .map((swatch) => {
                      return (
                        <SwatchGroup
                          className={SwatchGroup.default.className}
                          key={swatch.node.entityId}
                          role="radiogroup"
                        >
                          <>
                            <Label className={SwatchGroup.Label.className}>
                              <span>{swatch.node.displayName}</span>
                            </Label>
                            {swatch.node.values.edges.map((variant) => {
                              return (
                                <Swatch
                                  className={Swatch.default.className}
                                  key={variant.node.entityId}
                                >
                                  <Swatch.Label
                                    className={Swatch.Label.default.className}
                                    title={variant.node.label}
                                  >
                                    <Swatch.Variant
                                      className={Swatch.Variant.default.className}
                                      variantColor={variant.node.hexColors[0]}
                                    />
                                  </Swatch.Label>
                                  <Swatch.Input
                                    aria-label={variant.node.label}
                                    className={Swatch.Input.default.className}
                                    name={`${variant.node.entityId}`}
                                    onClick={() => onSwatchClick(variant.node.entityId)}
                                    type="radio"
                                    value={variant.node.entityId}
                                  />
                                </Swatch>
                              );
                            })}
                          </>
                        </SwatchGroup>
                      );
                    })}
                </div>
                <div className="mb-10">
                  <label className="font-semibold" htmlFor="qty">
                    Quantity:
                  </label>
                  <div className="flex item-center w-[120px] h-[48px] border-2 mt-2">
                    <button className="w-[44px]">+</button>
                    <input
                      className="w-[32px] text-center"
                      id="qty"
                      name="qty"
                      readOnly
                      type="tel"
                      value="1"
                    />
                    <button className="w-[44px]">-</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 flex justify-between mb-12">
                  <Button className={`${Button.primary.className} col-span-1`}>
                    <CartIcon className={Button.Icon.className} /> Add to cart
                  </Button>
                  <Button className={`${Button.secondary.className} col-span-1`}>
                    <HeartIcon className={Button.Icon.className} /> Save to wishlist
                  </Button>
                </div>
              </form>

              <div className="additional-details">
                <h2 className="text-xl text-black font-bold mb-4">Additional details</h2>

                <ul className="flex flex-wrap">
                  <li className="w-[50%] mb-4 order-1 pr-2">
                    <h3 className="font-semibold text-black">SKU</h3>
                    <p className="text-black">{variantSku || product.sku}</p>
                  </li>
                  <li className="w-[50%] mb-4 order-3 pr-2">
                    <h3 className="font-semibold text-black">UPC</h3>
                    <p className="text-black">{variantUpc || product.upc}</p>
                  </li>
                  <li className="w-[50%] mb-4 order-5 pr-2">
                    <h3 className="font-semibold text-black">Minimum purchase</h3>
                    <p className="text-black">
                      {product.minPurchaseQuantity ? product.minPurchaseQuantity : '1'} unit
                    </p>
                  </li>
                  <li className="w-[50%] mb-4 order-7 pr-2">
                    <h3 className="font-semibold text-black">Maximum purchase</h3>
                    <p className="text-black">
                      {product.maxPurchaseQuantity ? product.maxPurchaseQuantity : '10'} units
                    </p>
                  </li>
                  <li className="w-[50%] mb-4 order-2 pl-2">
                    <h3 className="font-semibold text-black">Availability</h3>
                    <p className="text-black">
                      {product.availabilityV2.description
                        ? product.availabilityV2.description
                        : '2-3 business days'}
                    </p>
                  </li>
                  <li className="w-[50%] mb-4 order-4 pl-2">
                    <h3 className="font-semibold text-black">Condition</h3>
                    <p className="text-black">{product.condition ? product.condition : 'New'}</p>
                  </li>
                  <li className="w-[50%] mb-4 order-6 pl-2">
                    <h3 className="font-semibold text-black">Material</h3>
                    <p className="text-black">100% original material</p>
                  </li>
                  <li className="w-[50%] mb-4 order-8 pl-2">
                    <h3 className="font-semibold text-black">Fit</h3>
                    <p className="text-black">Unisex</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer brands={brands} categoryTree={categoryTree} settings={settings} />
    </>
  );
}
