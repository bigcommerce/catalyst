import { client } from '../client';

export const getProductReviewSummary = async (productId: number) => {
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
      },
    },
  });

  return site.product.reviewSummary;
};
