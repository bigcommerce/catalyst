import { client } from '../client';
import { QueryGenqlSelection } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

interface GetFeaturedProductsOptions {
  first: number;
  imageWidth: number;
  imageHeight: number;
}

export const getFeaturedProducts = async ({
  first = 10,
  imageHeight = 300,
  imageWidth = 300,
}: Partial<GetFeaturedProductsOptions> = {}) => {
  const query = {
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
              altText: true,
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

  const { site } = await client.query(query);

  return removeEdgesAndNodes(site.featuredProducts).map((product) => {
    const { prices, ...rest } = product;

    return {
      ...rest,
      price: prices?.price,
    };
  });
};
