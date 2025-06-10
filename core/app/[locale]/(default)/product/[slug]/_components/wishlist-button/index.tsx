import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { Favorite } from '@/vibes/soul/primitives/favorite';
import { getSessionCustomerAccessToken, isLoggedIn } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { WishlistButtonDropdown } from './dropdown';

const wishlistButtonLimit = 50;
const WishlistButtonQuery = graphql(`
  query WishlistButtonQuery($first: Int, $productId: Int!) {
    customer {
      wishlistsContainingProduct: wishlists(
        first: $first
        filters: { productEntityIds: [$productId] }
      ) {
        edges {
          node {
            entityId
            name
            items(first: 50, filters: { productEntityIds: [$productId] }) {
              edges {
                node {
                  entityId
                  productEntityId
                  variantEntityId
                  product {
                    sku
                  }
                }
              }
            }
          }
        }
      }
      wishlists(first: $first) {
        edges {
          node {
            entityId
            name
          }
        }
      }
    }
  }
`);

const getWishlistButtonData = cache(async (productId: number, customerAccessToken?: string) => {
  if (!customerAccessToken) {
    return null;
  }

  const { data } = await client.fetch({
    document: WishlistButtonQuery,
    variables: { productId, first: wishlistButtonLimit },
    customerAccessToken,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
  });

  return data.customer;
});

export interface WishlistButtonWishlistInfo {
  entityId: number;
  name: string;
  wishlistItemId?: number;
}

interface WishlistButton {
  isProductInWishlist: boolean;
  wishlists: WishlistButtonWishlistInfo[];
}

async function getWishlistButton(
  productId: number,
  productSku?: Streamable<string>,
): Promise<WishlistButton> {
  const t = await getTranslations('Wishlist.Button');
  const data = await getWishlistButtonData(productId, await getSessionCustomerAccessToken());

  if (!data?.wishlists.edges?.length) {
    const defaultWishlist: WishlistButtonWishlistInfo = {
      entityId: 0,
      name: t('defaultWishlistName'),
    };

    return {
      isProductInWishlist: false,
      wishlists: [defaultWishlist],
    };
  }

  const sku = await productSku;
  const wishlistsWithSku = removeEdgesAndNodes(data.wishlistsContainingProduct)
    .map((wishlist) => ({
      ...wishlist,
      items: removeEdgesAndNodes(wishlist.items),
    }))
    .filter((wishlist) => wishlist.items.some(({ product }) => product?.sku === sku));

  const allWishlists = removeEdgesAndNodes(data.wishlists);
  const wishlists: WishlistButtonWishlistInfo[] = allWishlists
    .map(({ entityId, name }) => ({
      entityId,
      name,
      wishlistItemId: wishlistsWithSku
        .find((wishlist) => wishlist.entityId === entityId)
        ?.items.find(({ product }) => product?.sku === sku)?.entityId,
    }))
    .sort((a, b) => {
      const aHasProduct = a.wishlistItemId !== undefined;
      const bHasProduct = b.wishlistItemId !== undefined;

      if (aHasProduct === bHasProduct) {
        return b.entityId - a.entityId;
      }

      return aHasProduct ? -1 : 1;
    });

  return {
    isProductInWishlist: wishlistsWithSku.length > 0,
    wishlists,
  };
}

interface Props {
  productId: number;
  formId: string;
  productSku?: Streamable<string>;
}

export const WishlistButton = async ({ productId, productSku, formId }: Props) => {
  const t = await getTranslations('Wishlist.Button');
  const { isProductInWishlist, wishlists } = await getWishlistButton(productId, productSku);

  return (
    <WishlistButtonDropdown
      formId={formId}
      isLoggedIn={await isLoggedIn()}
      newWishlistLabel={t('addToNewWishlist')}
      wishlists={wishlists}
    >
      <Favorite checked={isProductInWishlist} label={t('label')} />
    </WishlistButtonDropdown>
  );
};
