import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  BlogPost,
  BlogPostCard,
  BlogPostCardSkeleton,
} from '@/vibes/soul/primitives/blog-post-card';

interface Props {
  posts: Streamable<BlogPost[]>;
  className?: string;
}

export function BlogPostList({ posts: streamablePosts, className = '' }: Props) {
  return (
    <div className={clsx('@container', className)}>
      <div className="mx-auto grid grid-cols-1 gap-x-5 gap-y-8 @md:grid-cols-2 @xl:gap-y-10 @3xl:grid-cols-3 @6xl:grid-cols-4">
        <Stream
          fallback={Array.from({ length: 5 }).map((_, index) => (
            <BlogPostCardSkeleton key={index} />
          ))}
          value={streamablePosts}
        >
          {(posts) => posts.map((post) => <BlogPostCard key={post.id} {...post} />)}
        </Stream>
      </div>
    </div>
  );
}
