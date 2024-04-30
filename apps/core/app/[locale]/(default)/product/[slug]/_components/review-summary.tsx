import { getLocale, getTranslations } from 'next-intl/server';
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

export const ReviewSummary = async ({ data }: Props) => {
  const summaryId = useId();
  const locale = await getLocale();

  const t = await getTranslations({ locale, namespace: 'Product.Details.ReviewSummary' });

  const { numberOfReviews, averageRating } = data.reviewSummary;

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
