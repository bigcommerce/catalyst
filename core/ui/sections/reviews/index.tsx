import { Stream, Streamable } from '@/ui/lib/streamable';
import { CursorPagination, CursorPaginationInfo } from '@/ui/primitives/cursor-pagination';
import { Rating } from '@/ui/primitives/rating';
import { StickySidebarLayout } from '@/ui/sections/sticky-sidebar-layout';

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
  totalCount?: Streamable<number>;
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
                      <h2 className="mt-0 mb-4 text-xl font-medium @xl:my-5 @xl:text-2xl">
                        {reviewsLabel}
                      </h2>
                    </div>
                  }
                  value={streamableTotalCount}
                >
                  {(totalCount) => (
                    <h2 className="mt-0 mb-4 text-xl font-medium @xl:my-5 @xl:text-2xl">
                      {reviewsLabel} <span className="text-contrast-300">{totalCount}</span>
                    </h2>
                  )}
                </Stream>
                <Stream
                  fallback={
                    <div className="animate-pulse">
                      <div className="bg-contrast-100 font-heading mb-2 h-[1lh] w-[3ch] rounded-md text-5xl leading-none tracking-tighter @2xl:text-6xl" />
                      <div className="bg-contrast-100 h-5 w-32 rounded-md" />
                    </div>
                  }
                  value={streamableAverageRating}
                >
                  {(averageRating) => (
                    <>
                      <div className="font-heading mb-2 text-5xl leading-none tracking-tighter @2xl:text-6xl">
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
            <div className="border-contrast-100 flex-1 border-t">
              {reviews.map(({ id, rating, review, name, date }) => {
                return (
                  <div className="border-contrast-100 border-b py-6" key={id}>
                    <Rating rating={rating} />
                    <p className="text-foreground mt-5 text-lg font-semibold">{name}</p>
                    <p className="text-contrast-500 mt-2 mb-8 leading-normal">{review}</p>
                    <p className="text-contrast-500 text-sm">{date}</p>
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
}: {
  message?: string;
  reviewsLabel?: string;
}) {
  return (
    <StickySidebarLayout
      sidebar={
        <>
          <h2 className="mt-0 mb-4 text-xl font-medium @xl:my-5 @xl:text-2xl">
            {reviewsLabel} <span className="text-contrast-300">0</span>
          </h2>
          <div className="font-heading mb-2 text-5xl leading-none tracking-tighter @2xl:text-6xl">
            0
          </div>
          <Rating rating={0} />
        </>
      }
      sidebarSize="medium"
    >
      <div className="border-contrast-100 flex-1 border-t py-12">
        <p className="text-center">{message}</p>
      </div>
    </StickySidebarLayout>
  );
}

export function ReviewsSkeleton({ reviewsLabel = 'Reviews' }: { reviewsLabel?: string }) {
  return (
    <StickySidebarLayout
      sidebar={
        <div className="animate-pulse">
          <h2 className="mt-0 mb-4 text-xl font-medium @xl:my-5 @xl:text-2xl">{reviewsLabel}</h2>
          <div className="bg-contrast-100 font-heading mb-2 h-[1lh] w-[3ch] rounded-md text-5xl leading-none tracking-tighter @2xl:text-6xl" />
          <div className="bg-contrast-100 h-5 w-32 rounded-md" />
        </div>
      }
      sidebarSize="medium"
    >
      <div className="border-contrast-100 flex-1 animate-pulse border-t">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="border-contrast-100 border-b py-6" key={index}>
            <div className="bg-contrast-100 h-5 w-32 rounded-md" />
            <div className="bg-contrast-100 mt-5 h-[1lh] rounded-md text-lg font-semibold" />
            <div className="bg-contrast-100 mt-2 mb-8 h-[1lh] w-1/2 rounded-md leading-normal" />
            <div className="bg-contrast-100 h-[1lh] w-24 rounded-md text-sm" />
          </div>
        ))}
      </div>
    </StickySidebarLayout>
  );
}
