'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';

const AddWishlistItemsMutation = graphql(`
  mutation addWishlistItems($input: AddWishlistItemsInput!, $hideOutOfStock: Boolean) {
    wishlist {
      addWishlistItems(input: $input) {
        result {
          entityId
          name
          items(hideOutOfStock: $hideOutOfStock) {
            edges {
              node {
                entityId
                product {
                  name
                  entityId
                }
              }
            }
          }
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof AddWishlistItemsMutation>;
type Input = Variables['input'];

export interface AddWishlistItems {
  hideOutOfStock?: boolean;
  input: Input;
}

export const addWishlistItems = async ({ hideOutOfStock = false, input }: AddWishlistItems) => {
  const t = await getTranslations('Account.Wishlist');
  const customerId = await getSessionCustomerId();

  try {
    const response = await client.fetch({
      document: AddWishlistItemsMutation,
      variables: { hideOutOfStock, input },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });

    const { addWishlistItems: addedWishlistItems } = response.data.wishlist;
    const wishlist = addedWishlistItems?.result;

    if (wishlist) {
      return {
        status: 'success' as const,
        data: {
          ...wishlist,
          items: removeEdgesAndNodes(wishlist.items),
        },
      };
    }

    return {
      status: 'error' as const,
      message: t('Errors.error'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error' as const,
        message: error.message,
      };
    }

    return { status: 'error' as const, message: t('error') };
  }
};
