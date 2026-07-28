import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Rating } from '@/vibes/soul/primitives/rating';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

import { ReviewForm, SubmitReviewAction } from './review-form';

interface Review {
  id: string;
  rating: number;
  review: string;
  name: string;
  date: string;
}

interface Props {
  reviews: Streamable<Review[]>;
  averageRating: Streamable<number>;
  totalCount?: Streamable<string>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  nextLabel?: Streamable<string>;
  previousLabel?: Streamable<string>;
  emptyStateMessage?: string;
  reviewsLabel?: string;
  productId: number;
  action: SubmitReviewAction;
  formButtonLabel?: string;
  formModalTitle?: string;
  formSubmitLabel?: string;
  formRatingLabel?: string;
  formTitleLabel?: string;
  formReviewLabel?: string;
  formNameLabel?: string;
  formEmailLabel?: string;
  streamableImages: Streamable<Array<{ src: string; alt: string }>>;
  streamableProduct: Streamable<{ name: string }>;
  streamableUser: Streamable<{ email: string; name: string }>;
}

export function Reviews({
  productId,
  reviews: streamableReviews,
  averageRating: streamableAverageRating,
  totalCount: streamableTotalCount,
  paginationInfo: streamablePaginationInfo,
  nextLabel,
  previousLabel,
  emptyStateMessage,
  reviewsLabel = 'Reviews',
  action,
  formButtonLabel = 'Write a review',
  formModalTitle,
  formSubmitLabel,
  formRatingLabel,
  formTitleLabel,
  formReviewLabel,
  formNameLabel,
  formEmailLabel,
  streamableProduct,
  streamableImages,
  streamableUser,
}: Readonly<Props>) {
  return (
    <Stream fallback={<ReviewsSkeleton reviewsLabel={reviewsLabel} />} value={streamableReviews}>
      {(reviews) => {
        if (reviews.length === 0)
          return (
            <ReviewsEmptyState
              action={action}
              formButtonLabel={formButtonLabel}
              formEmailLabel={formEmailLabel}
              formModalTitle={formModalTitle}
              formNameLabel={formNameLabel}
              formRatingLabel={formRatingLabel}
              formReviewLabel={formReviewLabel}
              formSubmitLabel={formSubmitLabel}
              formTitleLabel={formTitleLabel}
              message={emptyStateMessage}
              productId={productId}
              reviewsLabel={reviewsLabel}
              streamableImages={streamableImages}
              streamableProduct={streamableProduct}
              streamableUser={streamableUser}
            />
          );

        return (
          <StickySidebarLayout
            sidebar={
              <>
                <Stream
                  fallback={
                    <div className="animate-pulse">
                      <h2 className="mb-4 mt-0 text-xl font-medium @xl:my-5 @xl:text-2xl">
                        {reviewsLabel}
                      </h2>
                    </div>
                  }
                  value={streamableTotalCount}
                >
                  {(totalCount) => (
                    <h2 className="mb-4 mt-0 text-xl font-medium @xl:my-5 @xl:text-2xl">
                      {reviewsLabel} <span className="text-contrast-300">{totalCount}</span>
                    </h2>
                  )}
                </Stream>
                <Stream
                  fallback={
                    <div className="animate-pulse">
                      <div className="mb-2 h-[1lh] w-[3ch] rounded-md bg-contrast-100 font-heading text-5xl leading-none tracking-tighter @2xl:text-6xl" />
                      <div className="h-5 w-32 rounded-md bg-contrast-100" />
                    </div>
                  }
                  value={streamableAverageRating}
                >
                  {(averageRating) => (
                    <>
                      <div className="mb-2 font-heading text-5xl leading-none tracking-tighter @2xl:text-6xl">
                        {averageRating}
                      </div>
                      <Rating rating={averageRating} showRating={false} />
                    </>
                  )}
                </Stream>
                <ReviewForm
                  action={action}
                  formEmailLabel={formEmailLabel}
                  formModalTitle={formModalTitle}
                  formNameLabel={formNameLabel}
                  formRatingLabel={formRatingLabel}
                  formReviewLabel={formReviewLabel}
                  formSubmitLabel={formSubmitLabel}
                  formTitleLabel={formTitleLabel}
                  productId={productId}
                  streamableImages={streamableImages}
                  streamableProduct={streamableProduct}
                  streamableUser={streamableUser}
                  trigger={
                    <Button className="mx-auto mt-8" size="small" variant="tertiary">
                      {formButtonLabel}
                    </Button>
                  }
                />
              </>
            }
            sidebarSize="medium"
          >
            <div className="flex-1 border-t border-contrast-100">
              {reviews.map(({ id, rating, review, name, date }) => {
                return (
                  <div className="border-b border-contrast-100 py-6" key={id}>
                    <Rating rating={rating} />
                    <p className="mt-5 text-lg font-semibold text-foreground">{name}</p>
                    <p className="mb-8 mt-2 leading-normal text-contrast-500">{review}</p>
                    <p className="text-sm text-contrast-500">{date}</p>
                  </div>
                );
              })}

              <Stream value={streamablePaginationInfo}>
                {(paginationInfo) =>
                  paginationInfo && (
                    <CursorPagination
                      info={paginationInfo}
                      nextLabel={nextLabel}
                      previousLabel={previousLabel}
                      scroll={false}
                    />
                  )
                }
              </Stream>
            </div>
          </StickySidebarLayout>
        );
      }}
    </Stream>
  );
}

export function ReviewsEmptyState({
  message = 'No reviews have been added for this product',
  reviewsLabel = 'Reviews',
  productId,
  action,
  formButtonLabel = 'Write a review',
  formModalTitle,
  formSubmitLabel,
  formRatingLabel,
  formTitleLabel,
  formReviewLabel,
  formNameLabel,
  formEmailLabel,
  streamableProduct,
  streamableImages,
  streamableUser,
}: {
  message?: string;
  reviewsLabel?: string;
  productId: number;
  action: SubmitReviewAction;
  formButtonLabel?: string;
  formModalTitle?: string;
  formSubmitLabel?: string;
  formRatingLabel?: string;
  formTitleLabel?: string;
  formReviewLabel?: string;
  formNameLabel?: string;
  formEmailLabel?: string;
  streamableImages: Streamable<Array<{ src: string; alt: string }>>;
  streamableProduct: Streamable<{ name: string }>;
  streamableUser: Streamable<{ email: string; name: string }>;
}) {
  return (
    <StickySidebarLayout
      sidebar={
        <>
          <h2 className="mb-4 mt-0 text-xl font-medium @xl:my-5 @xl:text-2xl">
            {reviewsLabel} <span className="text-contrast-300">0</span>
          </h2>
          <div className="mb-2 font-heading text-5xl leading-none tracking-tighter @2xl:text-6xl">
            0
          </div>
          <Rating rating={0} />
        </>
      }
      sidebarSize="medium"
    >
      <div className="flex flex-1 flex-col border-t border-contrast-100 py-12">
        <p className="text-center">{message}</p>
        <ReviewForm
          action={action}
          formEmailLabel={formEmailLabel}
          formModalTitle={formModalTitle}
          formNameLabel={formNameLabel}
          formRatingLabel={formRatingLabel}
          formReviewLabel={formReviewLabel}
          formSubmitLabel={formSubmitLabel}
          formTitleLabel={formTitleLabel}
          productId={productId}
          streamableImages={streamableImages}
          streamableProduct={streamableProduct}
          streamableUser={streamableUser}
          trigger={
            <Button className="mx-auto mt-8" size="small" variant="tertiary">
              {formButtonLabel}
            </Button>
          }
        />
      </div>
    </StickySidebarLayout>
  );
}

export function ReviewsSkeleton({ reviewsLabel = 'Reviews' }: { reviewsLabel?: string }) {
  return (
    <StickySidebarLayout
      sidebar={
        <div className="animate-pulse">
          <h2 className="mb-4 mt-0 text-xl font-medium @xl:my-5 @xl:text-2xl">{reviewsLabel}</h2>
          <div className="mb-2 h-[1lh] w-[3ch] rounded-md bg-contrast-100 font-heading text-5xl leading-none tracking-tighter @2xl:text-6xl" />
          <div className="h-5 w-32 rounded-md bg-contrast-100" />
        </div>
      }
      sidebarSize="medium"
    >
      <div className="flex-1 animate-pulse border-t border-contrast-100">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="border-b border-contrast-100 py-6" key={index}>
            <div className="h-5 w-32 rounded-md bg-contrast-100" />
            <div className="mt-5 h-[1lh] rounded-md bg-contrast-100 text-lg font-semibold" />
            <div className="mb-8 mt-2 h-[1lh] w-1/2 rounded-md bg-contrast-100 leading-normal" />
            <div className="h-[1lh] w-24 rounded-md bg-contrast-100 text-sm" />
          </div>
        ))}
      </div>
    </StickySidebarLayout>
  );
}
