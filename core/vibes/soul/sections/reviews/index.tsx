import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel'
import { Rating } from '@/vibes/soul/primitives/rating'

export interface Props {
  reviews: {
    id: string
    review: string
    name: string
    date: string
  }[]
  averageRating: number
}

export const Reviews = function Reviews({ reviews, averageRating }: Readonly<Props>) {
  return (
    <div className="@container">
      <div className="mx-auto max-w-screen-2xl px-3 @xl:px-6 @5xl:px-20">
        <h2 className="border-t border-t-contrast-100 pb-6 pt-10 text-2xl font-medium @4xl:pt-20">
          Reviews <span className="text-contrast-300">{reviews.length}</span>
        </h2>
        <span className="font-heading text-6xl @2xl:text-8xl">{averageRating}</span>
        <Rating rating={averageRating} className="-mt-3 mb-3" />
      </div>
      <Carousel className="pt-6 @4xl:pt-8">
        <CarouselContent className="mb-20 @xl:px-6 @5xl:px-20">
          {reviews.map(({ id, review, name, date }) => {
            return (
              <CarouselItem key={id} className="basis-1/3">
                <div className="flex flex-col border-t border-t-contrast-200">
                  <p className="my-10 text-sm">{review}</p>
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-sm text-contrast-400">{date}</span>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <div className="flex items-center justify-between px-3 @xl:px-6 @5xl:px-20">
          <CarouselScrollbar />
          <CarouselButtons />
        </div>
      </Carousel>
    </div>
  )
}
