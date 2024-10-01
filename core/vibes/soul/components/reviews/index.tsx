import { Carousel } from '@/vibes/soul/components/carousel';
import { Rating } from '@/vibes/soul/components/rating';

export interface Props {
  reviews: Array<{
    id: string;
    review: string;
    name: string;
    date: string;
  }>;
  averageRating: number;
}

export const Reviews = function Reviews({ reviews, averageRating }: Readonly<Props>) {
  return (
    <div className="@container">
      <div className="mx-auto max-w-screen-2xl px-3 @xl:px-6 @5xl:px-20">
        <h2 className="border-t border-t-contrast-100 pb-6 pt-10 text-2xl font-medium @4xl:pt-20">
          Reviews <span className="text-contrast-300">{reviews.length}</span>
        </h2>
        <span className="font-heading text-6xl @2xl:text-8xl">{averageRating}</span>
        <Rating className="-mt-3 mb-3" rating={averageRating} />
      </div>
      <Carousel className="pb-10 @4xl:pb-20" contentClassName="!gap-6">
        {reviews.map(({ id, review, name, date }) => {
          return (
            <div
              className="mb-10 flex min-w-full flex-col border-t border-t-contrast-200 @lg:min-w-96"
              key={id}
            >
              <p className="my-10 text-sm">{review}</p>
              <span className="text-sm font-medium">{name}</span>
              <span className="text-sm text-contrast-400">{date}</span>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};
