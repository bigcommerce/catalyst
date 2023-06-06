import { client } from '../client';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export const getProductReviews = async (productId: number) => {
  const { site } = await client.query({
    site: {
      product: {
        __args: {
          entityId: productId,
        },
        reviewSummary: {
          summationOfRatings: true,
          numberOfReviews: true,
          averageRating: true,
        },
        reviews: {
          __args: {
            first: 5,
          },
          edges: {
            node: {
              author: {
                name: true,
              },
              entityId: true,
              title: true,
              text: true,
              rating: true,
              createdAt: {
                utc: true,
              },
            },
          },
        },
      },
    },
  });

  const product = site.product;

  if (!product) {
    return undefined;
  }

  return {
    reviewSummary: product.reviewSummary,
    reviews: removeEdgesAndNodes(product.reviews),
  };
};
