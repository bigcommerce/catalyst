import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Rating } from '~/components/ui/rating';

import { ProductReviewSchema, ProductReviewSchemaFragment } from './product-review-schema';

export const ReviewsQuery = graphql(
  `
    query ReviewsQuery($entityId: Int!) {
      site {
        product(entityId: $entityId) {
          reviews(first: 5) {
            edges {
              node {
                ...ProductReviewSchemaFragment
                author {
                  name
                }
                entityId
                title
                text
                rating
                createdAt {
                  utc
                }
              }
            }
          }
        }
      }
    }
  `,
  [ProductReviewSchemaFragment],
);

interface Props {
  productId: number;
}

export const Reviews = async ({ productId }: Props) => {
  const t = await getTranslations('Product.DescriptionAndReviews');
  const format = await getFormatter();

  const { data } = await client.fetch({
    document: ReviewsQuery,
    variables: { entityId: productId },
    fetchOptions: { next: { revalidate } },
  });

  const product = data.site.product;

  if (!product) {
    return null;
  }

  const reviews = removeEdgesAndNodes(product.reviews);

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
                  {format.dateTime(new Date(review.createdAt.utc), {
                    dateStyle: 'medium',
                  })}
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
