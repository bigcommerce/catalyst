import { client } from '../client';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

interface GetBrandsOptions {
  first?: number;
}

export const getBrands = async ({ first = 5 }: GetBrandsOptions = {}) => {
  const { site } = await client.query({
    site: {
      brands: {
        __args: {
          first,
        },
        edges: {
          node: {
            name: true,
            path: true,
          },
        },
      },
    },
  });

  return removeEdgesAndNodes(site.brands);
};
