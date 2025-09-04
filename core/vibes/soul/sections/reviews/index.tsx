import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Rating } from '@/vibes/soul/primitives/rating';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

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
}

export function Reviews({
  reviews: streamableReviews,
  averageRating: streamableAverageRating,
  totalCount: streamableTotalCount,
  paginationInfo: streamablePaginationInfo,
  nextLabel,
  previousLabel,
  emptyStateMessage,
  reviewsLabel = 'Reviews',
}: Readonly<Props>) {
  return (
    <Stream fallback={<ReviewsSkeleton reviewsLabel={reviewsLabel} />} value={streamableReviews}>
      {(reviews) => {
        if (reviews.length === 0)
          return <ReviewsEmptyState message={emptyStateMessage} reviewsLabel={reviewsLabel} />;

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

function ReviewsEmptyState({
  message = 'No reviews have been added for this product',
  reviewsLabel = 'Reviews',
}: {
  message?: string;
  reviewsLabel?: string;
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
      <div className="flex-1 border-t border-contrast-100 py-12">
        <p className="text-center">{message}</p>
      </div>
    </StickySidebarLayout>
  );
}

function ReviewsSkeleton({ reviewsLabel = 'Reviews' }: { reviewsLabel?: string }) {
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
