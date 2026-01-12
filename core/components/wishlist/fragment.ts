import { PaginationFragment } from '~/client/fragments/pagination';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';

export const WishlistItemProductFragment = graphql(
  `
    fragment WishlistItemProductFragment on Product {
      entityId
      name
      defaultImage {
        altText
        url: urlTemplate(lossy: true)
      }
      path
      brand {
        name
        path
      }
      reviewSummary {
        numberOfReviews
        averageRating
      }
      sku
      showCartAction
      inventory {
        isInStock
      }
      availabilityV2 {
        status
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);

export const WishlistItemFragment = graphql(
  `
    fragment WishlistItemFragment on WishlistItem {
      entityId
      productEntityId
      variantEntityId
      product {
        ...WishlistItemProductFragment
      }
    }
  `,
  [WishlistItemProductFragment],
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
  [WishlistItemFragment],
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
  [WishlistFragment, PaginationFragment],
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
  [WishlistItemFragment, PaginationFragment],
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
  [WishlistItemFragment, PaginationFragment],
);
