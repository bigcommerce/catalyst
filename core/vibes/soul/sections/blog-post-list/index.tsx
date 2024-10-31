import { clsx } from 'clsx'

import {
  BlogPost,
  BlogPostCard,
  BlogPostCardSkeleton,
} from '@/vibes/soul/primitives/blog-post-card'

interface Props {
  posts: BlogPost[]
  className?: string
}

export const BlogPostList = function BlogPostList({ posts, className = '' }: Props) {
  return (
    <div className={clsx('w-full @container', className)}>
      <div className="mx-auto grid grid-cols-1 gap-x-5 gap-y-8 @md:grid-cols-2 @xl:gap-y-10 @3xl:grid-cols-3 @6xl:grid-cols-4">
        {posts.length > 0
          ? posts.map(post => <BlogPostCard key={post.id} {...post} />)
          : Array.from({ length: 5 }).map((_, index) => <BlogPostCardSkeleton key={index} />)}
      </div>
    </div>
  )
}
