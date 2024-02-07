import { Rating } from '@bigcommerce/components/Rating';

import { getProductReviews } from '~/client/queries/get-product-reviews';

import { ProductReviewSchema } from './product-review-schema';

interface Props {
  productId: number;
}

export const Reviews = async ({ productId }: Props) => {
  const product = await getProductReviews(productId);
  const reviews = product?.reviews;

  if (!reviews) {
    return null;
  }

  return (
    <>
      <h3 className="mb-4 mt-8 text-h5">
        Reviews
        {reviews.length > 0 && (
          <span className="ms-2 ps-1 text-gray-500">
            <span className="sr-only">Count:</span>
            {reviews.length}
          </span>
        )}
      </h3>

      <ul className="lg:grid lg:grid-cols-2 lg:gap-8">
        {reviews.length === 0 ? (
          <p className="pb-6 pt-1">This product hasn't been reviewed yet.</p>
        ) : (
          reviews.map((review) => {
            return (
              <li key={review.entityId}>
                <p className="mb-3 flex flex-nowrap text-blue-primary">
                  <Rating value={review.rating} />
                  <span className="sr-only">Rating: ${review.rating} out of 5 stars</span>
                </p>
                <h4 className="text-base font-semibold">{review.title}</h4>
                <p className="mb-2 text-gray-500">
                  Posted by {review.author.name} on{' '}
                  {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
                    new Date(review.createdAt.utc),
                  )}
                </p>
                <p className="mb-6">{review.text}</p>
              </li>
            );
          })
        )}
      </ul>
      {reviews.length > 0 && <ProductReviewSchema productId={productId} reviews={reviews} />}
    </>
  );
};
