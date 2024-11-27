import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Rating } from '@/vibes/soul/primitives/rating';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

type Props = {
  reviews: Array<{
    id: string;
    rating: number;
    review: string;
    name: string;
    date: string;
  }>;
  averageRating: number;
  totalCount?: number;
  paginationInfo?: CursorPaginationInfo;
  emptyStateMessage?: string;
};

export function Reviews({
  reviews,
  averageRating,
  totalCount,
  paginationInfo,
  emptyStateMessage,
}: Readonly<Props>) {
  if (reviews.length === 0) return <ReviewsEmptyState message={emptyStateMessage} />;

  return (
    <StickySidebarLayout
      sidebar={
        <>
          <h2 className="mb-4 mt-0 text-xl font-medium @xl:my-5 @xl:text-2xl">
            Reviews <span className="text-contrast-300">{totalCount ?? reviews.length}</span>
          </h2>
          <div className="mb-2 font-heading text-5xl leading-none tracking-tighter @2xl:text-6xl">
            {averageRating}
          </div>
          <Rating rating={averageRating} showRating={false} />
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

        {paginationInfo && <CursorPagination info={paginationInfo} scroll={false} />}
      </div>
    </StickySidebarLayout>
  );
}

export function ReviewsEmptyState({
  message = 'No reviews have been added for this product',
}: {
  message?: string;
}) {
  return (
    <StickySidebarLayout
      sidebar={
        <>
          <h2 className="mb-4 mt-0 text-xl font-medium @xl:my-5 @xl:text-2xl">
            Reviews <span className="text-contrast-300">0</span>
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

export function ReviewsSkeleton() {
  return (
    <StickySidebarLayout
      sidebar={
        <div className="animate-pulse">
          <h2 className="mb-4 mt-0 text-xl font-medium @xl:my-5 @xl:text-2xl">Reviews</h2>
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
