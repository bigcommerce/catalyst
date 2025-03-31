import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';

export const WishlistItemFragment = graphql(
  `
    fragment WishlistItemFragment on WishlistItem {
      entityId
      productEntityId
      variantEntityId
      product {
        ...ProductCardFragment
        showCartAction
        inventory {
          isInStock
        }
        availabilityV2 {
          status
        }
      }
    }
  `,
  [ProductCardFragment],
);

export const WishlistFragment = graphql(
  `
    fragment WishlistFragment on Wishlist {
      entityId
      name
      isPublic
      token
      items(first: 6) {
        edges {
          node {
            ...WishlistItemFragment
          }
        }
        collectionInfo {
          totalItems
        }
      }
    }
  `,
  [WishlistItemFragment, ProductCardFragment],
);

export const WishlistsFragment = graphql(
  `
    fragment WishlistsFragment on WishlistConnection {
      edges {
        node {
          ...WishlistFragment
        }
      }
      pageInfo {
        ...PaginationFragment
      }
    }
  `,
  [WishlistFragment, ProductCardFragment, PaginationFragment],
);

export const WishlistPaginatedItemsFragment = graphql(
  `
    fragment WishlistPaginatedItemsFragment on Wishlist {
      entityId
      name
      isPublic
      token
      items(first: $first, after: $after, last: $last, before: $before) {
        edges {
          node {
            ...WishlistItemFragment
          }
        }
        pageInfo {
          ...PaginationFragment
        }
        collectionInfo {
          totalItems
        }
      }
    }
  `,
  [WishlistItemFragment, ProductCardFragment, PaginationFragment],
);

export const PublicWishlistFragment = graphql(
  `
    fragment PublicWishlistFragment on PublicWishlist {
      entityId
      name
      token
      items(first: $first, after: $after, last: $last, before: $before) {
        edges {
          node {
            ...WishlistItemFragment
          }
        }
        pageInfo {
          ...PaginationFragment
        }
        collectionInfo {
          totalItems
        }
      }
    }
  `,
  [WishlistItemFragment, ProductCardFragment, PaginationFragment],
);
