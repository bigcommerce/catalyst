import { Button } from '@bigcommerce/reactant/Button';
import { Rating } from '@bigcommerce/reactant/Rating';

import client from '~/client';

interface Props {
  productId: number;
  reviewSectionId: string;
}

export const Reviews = async ({ productId, reviewSectionId }: Props) => {
  const product = await client.getProductReviews(productId);
  const reviews = product?.reviews;

  if (!reviews) {
    return null;
  }

  return (
    <>
      <h3 className="mb-4 mt-8 text-h5">
        Reviews
        {reviews.length > 0 && (
          <span className="ms-2 pl-1 text-gray-500">
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

      <Button className="w-auto" disabled id={reviewSectionId} variant="secondary">
        Write a review
      </Button>
    </>
  );
};
