import merge from 'deepmerge';

import { client } from '../client';
import { QueryGenqlSelection } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

interface GetFeaturedProductsOptions {
  first: number;
  imageWidth: number;
  imageHeight: number;
}

export const getFeaturedProducts = async <R extends QueryGenqlSelection>(
  { first = 10, imageHeight = 300, imageWidth = 300 }: Partial<GetFeaturedProductsOptions> = {},
  customQuery?: R,
) => {
  const defaultQuery = {
    site: {
      featuredProducts: {
        __args: {
          first,
        },
        edges: {
          node: {
            name: true,
            entityId: true,
            prices: {
              price: {
                __scalar: true,
              },
            },
            brand: {
              name: true,
            },
            defaultImage: {
              url: {
                __args: {
                  width: imageWidth,
                  height: imageHeight,
                },
              },
            },
          },
        },
      },
    },
  } satisfies QueryGenqlSelection;

  // Not sure if we want this yet, but this supports passing a custom query
  // which gets merged with the default query, so you can add additional fields.
  // Concerns: We would expose the genql implementation details to the consumer
  const query = customQuery ? merge(defaultQuery, customQuery) : defaultQuery;

  const { site } = await client.query(query);

  return removeEdgesAndNodes(site.featuredProducts).map((product) => {
    const { prices, ...rest } = product;

    return {
      ...rest,
      price: prices?.price,
    };
  });
};
