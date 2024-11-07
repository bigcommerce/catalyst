import { Rating } from '@/vibes/soul/primitives/rating';

type Props = {
  reviews: Array<{
    id: string;
    rating: number;
    review: string;
    name: string;
    date: string;
  }>;
  averageRating: number;
};

export function Reviews({ reviews, averageRating }: Readonly<Props>) {
  return (
    <div className="@container">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-stretch gap-10 px-4 py-10 @xl:px-6 @xl:py-14 @2xl:flex-row @4xl:px-8 @4xl:py-20">
        <div className="w-40 @2xl:w-52">
          <div className="sticky top-12">
            <h2 className="mb-4 mt-0 text-xl font-medium @xl:my-5 @xl:text-2xl">
              Reviews <span className="text-contrast-300">{reviews.length}</span>
            </h2>
            <div className="mb-2 font-heading text-5xl leading-none tracking-tighter @2xl:text-6xl">
              {averageRating}
            </div>
            <Rating rating={averageRating} showRating={false} />
          </div>
        </div>

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

          {/* Pagination goes here */}
        </div>
      </div>
    </div>
  );
}
