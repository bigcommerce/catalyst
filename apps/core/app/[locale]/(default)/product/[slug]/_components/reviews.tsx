import { Rating } from '@bigcommerce/components/rating';
import { getTranslations } from 'next-intl/server';

import { getProductReviews } from '~/client/queries/get-product-reviews';

import { ProductReviewSchema } from './product-review-schema';

interface Props {
  productId: number;
}

export const Reviews = async ({ productId }: Props) => {
  const product = await getProductReviews(productId);
  const t = await getTranslations('Product.DescriptionAndReviews');
  const reviews = product?.reviews;

  if (!reviews) {
    return null;
  }

  return (
    <>
      <h3 className="mb-4 mt-8 text-xl font-bold md:text-2xl">
        {t('reviews')}
        {reviews.length > 0 && (
          <span className="ms-2 ps-1 text-gray-500">
            <span className="sr-only">{t('reviewsCount')}</span>
            {reviews.length}
          </span>
        )}
      </h3>

      <ul className="lg:grid lg:grid-cols-2 lg:gap-8">
        {reviews.length === 0 ? (
          <p className="pb-6 pt-1">{t('unreviewed')}</p>
        ) : (
          reviews.map((review) => {
            return (
              <li key={review.entityId}>
                <p className="mb-3 flex flex-nowrap text-primary">
                  <Rating value={review.rating} />
                  <span className="sr-only">{t('reviewRating', { rating: review.rating })}</span>
                </p>
                <h4 className="text-base font-semibold">{review.title}</h4>
                <p className="mb-2 text-gray-500">
                  {t('reviewAuthor', { author: review.author.name })}{' '}
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
