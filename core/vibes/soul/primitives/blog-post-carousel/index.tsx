import { BlogPost, BlogPostCard } from '@/vibes/soul/primitives/blog-post-card'
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel'

interface Props {
  className?: string
  blogPosts: BlogPost[]
}

export function BlogPostCarousel({ className, blogPosts }: Props) {
  return (
    <Carousel className={className}>
      <CarouselContent className="mb-20 px-3 @xl:px-6 @5xl:px-20">
        {blogPosts.map(post => {
          return (
            <CarouselItem className="basis-full @md:basis-1/2 @xl:basis-1/3">
              <BlogPostCard key={post.id} {...post} />
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <div className="flex items-center justify-between px-3 @xl:px-6 @5xl:px-20">
        <CarouselScrollbar />
        <CarouselButtons />
      </div>
    </Carousel>
  )
}
