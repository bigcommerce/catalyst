import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { FragmentOf, graphql } from '~/client/graphql';
import { Rating } from '~/components/ui/rating';
import { cn } from '~/lib/utils';

export const ReviewSummaryFragment = graphql(`
  fragment ReviewSummaryFragment on Product {
    reviewSummary {
      numberOfReviews
      averageRating
    }
  }
`);

interface Props {
  data: FragmentOf<typeof ReviewSummaryFragment>;
}

export const ReviewSummary = ({ data }: Props) => {
  const t = useTranslations('Product.Details.ReviewSummary');

  const summaryId = useId();

  const { numberOfReviews, averageRating } = data.reviewSummary;

  const hasNoReviews = numberOfReviews === 0;

  return (
    <div className="flex items-center gap-3">
      <p
        aria-describedby={summaryId}
        className={cn('flex flex-nowrap text-primary', hasNoReviews && 'text-gray-400')}
      >
        <Rating rating={averageRating} />
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
