import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { GalleryFragment } from '~/app/[locale]/(default)/product/[slug]/_components/gallery/fragment';
import { getSessionCustomerId } from '~/auth';
import { PricingFragment } from '~/components/pricing';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const CREATE_WISHLIST_MUTATION = graphql(
  `
    mutation CreateWishlist($input: CreateWishlistInput!) {
      wishlist {
        createWishlist(input: $input) {
          result {
            entityId
            name
            isPublic
            items {
              edges {
                node {
                  entityId
                  product {
                    entityId
                    name
                    path
                    brand {
                      name
                      path
                    }
                    ...GalleryFragment
                    ...PricingFragment
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  [GalleryFragment, PricingFragment],
);

type Variables = VariablesOf<typeof CREATE_WISHLIST_MUTATION>;
type Input = Variables['input'];

export const createWishlist = async (input: Input) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CREATE_WISHLIST_MUTATION,
    variables: { input },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  const newWishlist = response.data.wishlist.createWishlist?.result;

  if (!newWishlist) {
    return undefined;
  }

  return {
    ...newWishlist,
    items: removeEdgesAndNodes(newWishlist.items).map((item) => {
      return {
        ...item,
        product: {
          ...item.product,
          images: removeEdgesAndNodes(item.product.images),
        },
      };
    }),
  };
};
