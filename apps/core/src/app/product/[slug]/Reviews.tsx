import { getProductReviews } from '@bigcommerce/catalyst-client';
import { Button } from '@bigcommerce/reactant/Button';
import { Star, StarHalf } from 'lucide-react';

interface Props {
  productId: number;
  reviewSectionId: string;
}

export const Reviews = async ({ productId, reviewSectionId }: Props) => {
  const product = await getProductReviews(productId);
  const reviews = product?.reviews;

  if (!reviews) {
    return null;
  }

  return (
    <>
      <h3 className="mb-4 mt-8 text-h5">
        Reviews
        <span className="ms-2 text-gray-500">
          <span className="sr-only">Count:</span>
          {reviews.length}
        </span>
      </h3>

      <ul>
        {reviews.map((review) => {
          return (
            <li key={review.entityId}>
              <p className="mb-3 flex flex-nowrap text-blue-primary">
                {new Array(5).fill(undefined).map((_, i) => {
                  const index = i + 1;

                  if (review.rating >= index) {
                    return <Star fill="currentColor" key={i} role="presentation" />;
                  }

                  if (review.rating < index && review.rating - index > -1) {
                    return (
                      <span className="relative" key={i}>
                        <StarHalf fill="currentColor" role="presentation" />
                        <Star className="absolute left-0 top-0" key={i} role="presentation" />
                      </span>
                    );
                  }

                  return <Star key={i} role="presentation" />;
                })}
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
        })}
      </ul>

      <Button className="w-auto" id={reviewSectionId} variant="secondary">
        Write a review
      </Button>
    </>
  );
};
