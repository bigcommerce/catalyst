import { graphql } from '~/client/graphql';

export const CreateWishlistMutation = graphql(`
  mutation CreateWishlistMutation($input: CreateWishlistInput!) {
    wishlist {
      createWishlist(input: $input) {
        result {
          entityId
          name
          isPublic
        }
      }
    }
  }
`);

export const UpdateWishlistMutation = graphql(`
  mutation UpdateWishlistMutation($wishlistId: Int!, $input: WishlistUpdateDataInput!) {
    wishlist {
      updateWishlist(input: { entityId: $wishlistId, data: $input }) {
        result {
          entityId
          name
          isPublic
        }
      }
    }
  }
`);

export const DeleteWishlistItemsMutation = graphql(`
  mutation DeleteWishlistItemsMutation($wishlistId: Int!, $itemIds: [Int!]!) {
    wishlist {
      deleteWishlistItems(input: { entityId: $wishlistId, itemEntityIds: $itemIds }) {
        result {
          entityId
        }
      }
    }
  }
`);

export const DeleteWishlistMutation = graphql(`
  mutation DeleteWishlistMutation($wishlistId: Int!) {
    wishlist {
      deleteWishlists(input: { entityIds: [$wishlistId] }) {
        result
      }
    }
  }
`);
