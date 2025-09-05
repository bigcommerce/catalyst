import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  BlogPostCard,
  BlogPostCardBlogPost,
  BlogPostCardSkeleton,
} from '@/vibes/soul/primitives/blog-post-card';

interface Props {
  posts: Streamable<BlogPostCardBlogPost[]>;
  className?: string;
  emptyStateSubtitle?: Streamable<string | null>;
  emptyStateTitle?: Streamable<string | null>;
  placeholderCount?: number;
}

export function BlogPostList({
  posts: streamablePosts,
  className = '',
  emptyStateTitle,
  emptyStateSubtitle,
  placeholderCount = 6,
}: Props) {
  return (
    <Stream
      fallback={<BlogPostListSkeleton className={className} placeholderCount={placeholderCount} />}
      value={streamablePosts}
    >
      {(posts) => {
        if (posts.length === 0) {
          return (
            <BlogPostListEmptyState
              className={className}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <div className={clsx('@container', className)}>
            <div className="mx-auto grid grid-cols-1 gap-x-5 gap-y-8 @md:grid-cols-2 @xl:gap-y-10 @3xl:grid-cols-3 @6xl:grid-cols-4">
              {posts.map((post) => (
                <BlogPostCard blogPost={post} key={post.id} />
              ))}
            </div>
          </div>
        );
      }}
    </Stream>
  );
}

function BlogPostListSkeleton({
  className,
  placeholderCount = 6,
}: Pick<Props, 'className' | 'placeholderCount'>) {
  return (
    <div className={clsx('@container', className)}>
      <div className="mx-auto grid grid-cols-1 gap-x-5 gap-y-8 @md:grid-cols-2 @xl:gap-y-10 @3xl:grid-cols-3 @6xl:grid-cols-4">
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <BlogPostCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function BlogPostListEmptyState({
  className,
  placeholderCount = 6,
  emptyStateTitle,
  emptyStateSubtitle,
}: Omit<Props, 'posts'>) {
  return (
    <div className={clsx('relative w-full @container', className)}>
      <div
        className={clsx(
          'mx-auto grid grid-cols-1 gap-x-4 gap-y-6 [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)] @sm:grid-cols-2 @2xl:grid-cols-3 @2xl:gap-x-5 @2xl:gap-y-8 @5xl:grid-cols-4 @7xl:grid-cols-5',
        )}
      >
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <BlogPostCardSkeleton key={index} />
        ))}
      </div>
      <div className="absolute inset-0 mx-auto px-3 py-16 pb-3 @4xl:px-10 @4xl:pb-10 @4xl:pt-28">
        <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
          <h3 className="@4x:leading-none font-heading text-2xl leading-tight text-foreground @4xl:text-4xl">
            {emptyStateTitle}
          </h3>
          <p className="text-sm text-contrast-500 @4xl:text-lg">{emptyStateSubtitle}</p>
        </div>
      </div>
    </div>
  );
}
