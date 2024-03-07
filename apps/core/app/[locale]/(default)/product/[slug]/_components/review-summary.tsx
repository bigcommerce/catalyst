import { Rating } from '@bigcommerce/components/rating';
import { getLocale, getTranslations } from 'next-intl/server';
import { useId } from 'react';

import { getProductReviews } from '~/client/queries/get-product-reviews';
import { cn } from '~/lib/utils';

interface Props {
  productId: number;
}

export const ReviewSummary = async ({ productId }: Props) => {
  const summaryId = useId();
  const locale = await getLocale();

  const t = await getTranslations({ locale, namespace: 'Product.Details.ReviewSummary' });

  const reviews = await getProductReviews(productId);

  if (!reviews) {
    return null;
  }

  const { numberOfReviews, averageRating } = reviews.reviewSummary;

  const hasNoReviews = numberOfReviews === 0;

  return (
    <div className="flex items-center gap-3">
      <p
        aria-describedby={summaryId}
        className={cn('flex flex-nowrap text-primary', hasNoReviews && 'text-gray-400')}
      >
        <Rating value={averageRating} />
      </p>

      <div className="font-semibold" id={summaryId}>
        {!hasNoReviews && (
          <>
            <span className="sr-only">{t('rating')}</span>
            {averageRating}
            <span className="sr-only">{t('ratingRange')}</span>{' '}
          </>
        )}
        <span className="sr-only">{t('reviewsNumber')}</span>({numberOfReviews})
      </div>
    </div>
  );
};
