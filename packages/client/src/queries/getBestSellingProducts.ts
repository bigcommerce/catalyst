import { client } from '../client';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

interface GetBestSellingProductsOptions {
  first: number;
  imageWidth: number;
  imageHeight: number;
}

export const getBestSellingProducts = async ({
  first = 10,
  imageHeight = 300,
  imageWidth = 300,
}: Partial<GetBestSellingProductsOptions> = {}) => {
  const { site } = await client.query({
    site: {
      bestSellingProducts: {
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
  });

  return removeEdgesAndNodes(site.bestSellingProducts).map((product) => {
    const { prices, ...rest } = product;

    return {
      ...rest,
      price: prices?.price,
    };
  });
};
